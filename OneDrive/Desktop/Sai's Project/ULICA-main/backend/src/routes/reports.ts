import { Response, Router } from 'express';
import prisma from '../prisma/client';
import { asyncHandler } from '../middlewares/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Get analytics reports (Admin only)
router.get('/',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { range = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Previous period for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);

    // Get current period stats
    const [
      currentOrders,
      currentRevenue,
      currentCustomers,
      prevOrders,
      prevRevenue,
      prevCustomers,
      topProducts,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      // Current period orders
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      
      // Current period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'delivered',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      
      // Current period new customers
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          role: 'customer',
        },
      }),
      
      // Previous period orders
      prisma.order.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
      
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
          status: 'delivered',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      
      // Previous period new customers
      prisma.user.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
          role: 'customer',
        },
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            status: 'delivered',
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
        _count: {
          productId: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      
      // Monthly revenue for chart
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          SUM("totalAmount") as revenue
        FROM "Order"
        WHERE "status" = 'delivered'
          AND "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const ordersChange = calculateChange(currentOrders, prevOrders);
    const currentRevenueTotal = currentRevenue._sum?.totalAmount ?? 0;
    const prevRevenueTotal = prevRevenue._sum?.totalAmount ?? 0;
    const revenueChange = calculateChange(currentRevenueTotal, prevRevenueTotal);
    const customersChange = calculateChange(currentCustomers, prevCustomers);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            title: true,
          },
        });
        
        return {
          id: item.productId,
          name: product?.title || 'Unknown Product',
          sales: item._sum?.quantity || 0,
          revenue: item._sum?.price || 0,
        };
      })
    );

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Unknown Customer',
      total: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    }));

    // Format monthly revenue
    const formattedMonthlyRevenue = (monthlyRevenue as Array<{ month: Date; revenue: string }>).map(item => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: parseFloat(item.revenue) || 0,
    }));

    res.json({
      success: true,
      data: {
        sales: {
          total: currentOrders,
          change: ordersChange,
          period: range as string,
        },
        orders: {
          total: currentOrders,
          change: ordersChange,
          period: range as string,
        },
        customers: {
          total: currentCustomers,
          change: customersChange,
          period: range as string,
        },
        revenue: {
          total: currentRevenueTotal,
          change: revenueChange,
          period: range as string,
        },
        topProducts: topProductsWithDetails,
        recentOrders: formattedRecentOrders,
        monthlyRevenue: formattedMonthlyRevenue,
      },
    });
  })
);

export default router;
