// @ts-nocheck
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export interface CohortData {
  cohortMonth: string;
  totalUsers: number;
  retentionRates: Array<{
    period: number;
    rate: number;
  }>;
}

export interface CustomerLTVData {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  firstOrderDate: Date | null;
  daysSinceLastOrder: number | null;
  predictedLTV: number | null;
  segment: string | null;
}

export interface FunnelStep {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface CustomReportConfig {
  name: string;
  description?: string;
  query: Record<string, unknown>;
  filters?: Record<string, unknown>;
  isPublic?: boolean;
}

/**
 * Calculate cohort analysis data
 */
export async function calculateCohortAnalysis(startDate: Date, endDate: Date): Promise<CohortData[]> {
  // Get all users who made their first purchase in the date range
  const firstTimeBuyers = await prisma.user.findMany({
    where: {
      orders: {
        some: {
          paymentStatus: 'paid',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    include: {
      orders: {
        where: {
          paymentStatus: 'paid'
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  const cohortData: { [key: string]: CohortData } = {};

  for (const user of firstTimeBuyers) {
    const firstOrder = user.orders[0];
    if (!firstOrder) continue;

    const cohortMonth = firstOrder.createdAt.toISOString().substring(0, 7); // YYYY-MM
    
    if (!cohortData[cohortMonth]) {
      cohortData[cohortMonth] = {
        cohortMonth,
        totalUsers: 0,
        retentionRates: []
      };
    }

    cohortData[cohortMonth].totalUsers++;

    // Calculate retention for each period (1, 2, 3, 6, 12 months)
    const periods = [1, 2, 3, 6, 12];
    
    for (const period of periods) {
      const periodEndDate = new Date(firstOrder.createdAt);
      periodEndDate.setMonth(periodEndDate.getMonth() + period);

      const hasOrderInPeriod = user.orders.some(order => 
        order.createdAt >= firstOrder.createdAt && 
        order.createdAt <= periodEndDate
      );

      const existingRate = cohortData[cohortMonth].retentionRates.find(r => r.period === period);
      if (existingRate) {
        existingRate.rate = (existingRate.rate + (hasOrderInPeriod ? 1 : 0)) / 2;
      } else {
        cohortData[cohortMonth].retentionRates.push({
          period,
          rate: hasOrderInPeriod ? 1 : 0
        });
      }
    }
  }

  return Object.values(cohortData);
}

/**
 * Calculate customer lifetime value
 */
export async function calculateCustomerLTV(userId: string): Promise<CustomerLTVData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        where: {
          paymentStatus: 'paid'
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!user || user.orders.length === 0) {
    return null;
  }

  const totalOrders = user.orders.length;
  const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalSpent / totalOrders;
  const firstOrderDate = user.orders[0].createdAt;
  const lastOrderDate = user.orders[user.orders.length - 1].createdAt;
  const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

  // Simple LTV prediction based on historical data
  const avgDaysBetweenOrders = totalOrders > 1 ? 
    Math.floor((lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)) / (totalOrders - 1) : 30;
  
  const predictedOrdersPerYear = 365 / avgDaysBetweenOrders;
  const predictedLTV = Math.round(averageOrderValue * predictedOrdersPerYear * 2); // 2 years prediction

  // Segment customers based on LTV
  let segment = 'low_value';
  if (predictedLTV > 50000) segment = 'high_value';
  else if (predictedLTV > 20000) segment = 'medium_value';

  const ltvData: CustomerLTVData = {
    userId,
    totalOrders,
    totalSpent,
    averageOrderValue: Math.round(averageOrderValue),
    lastOrderDate,
    firstOrderDate,
    daysSinceLastOrder,
    predictedLTV,
    segment
  };

  // Upsert the LTV data
  await prisma.customerLifetimeValue.upsert({
    where: { userId },
    update: ltvData,
    create: ltvData
  });

  return ltvData;
}

/**
 * Get customer LTV data for all customers
 */
export async function getAllCustomerLTV(
  page: number = 1,
  limit: number = 20,
  segment?: string
): Promise<{ data: CustomerLTVData[], total: number, page: number, totalPages: number }> {
  const skip = (page - 1) * limit;
  const where: Prisma.CustomerLifetimeValueWhereInput = {};
  
  if (segment) {
    where.segment = segment;
  }

  const [ltvData, total] = await prisma.$transaction([
    prisma.customerLifetimeValue.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { totalSpent: 'desc' },
      skip,
      take: limit
    }),
    prisma.customerLifetimeValue.count({ where })
  ]);

  return {
    data: ltvData.map(item => ({
      userId: item.userId,
      totalOrders: item.totalOrders,
      totalSpent: item.totalSpent,
      averageOrderValue: item.averageOrderValue,
      lastOrderDate: item.lastOrderDate,
      firstOrderDate: item.firstOrderDate,
      daysSinceLastOrder: item.daysSinceLastOrder,
      predictedLTV: item.predictedLTV,
      segment: item.segment
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Track funnel step
 */
export async function trackFunnelStep(
  funnelName: string,
  step: string,
  userId?: string,
  sessionId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.funnelAnalysis.create({
    data: {
      funnelName,
      step,
      userId,
      sessionId,
      metadata: metadata ? JSON.stringify(metadata) : null
    }
  });
}

/**
 * Get funnel analysis
 */
export async function getFunnelAnalysis(
  funnelName: string,
  startDate: Date,
  endDate: Date
): Promise<FunnelStep[]> {
  const steps = await prisma.funnelAnalysis.findMany({
    where: {
      funnelName,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      step: true,
      userId: true,
      sessionId: true
    }
  });

  // Group by step and calculate metrics
  const stepData: { [key: string]: Set<string> } = {};
  const sessionData: { [key: string]: Set<string> } = {};

  for (const step of steps) {
    if (!stepData[step.step]) {
      stepData[step.step] = new Set();
      sessionData[step.step] = new Set();
    }
    
    if (step.userId) {
      stepData[step.step].add(step.userId);
    }
    if (step.sessionId) {
      sessionData[step.step].add(step.sessionId);
    }
  }

  const funnelSteps: FunnelStep[] = [];
  const stepNames = Object.keys(stepData).sort();
  let previousUsers = 0;

  for (let i = 0; i < stepNames.length; i++) {
    const stepName = stepNames[i];
    const users = stepData[stepName].size;
    const conversionRate = i === 0 ? 100 : previousUsers > 0 ? (users / previousUsers) * 100 : 0;
    const dropOffRate = i === 0 ? 0 : previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0;

    funnelSteps.push({
      step: stepName,
      users,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropOffRate: Math.round(dropOffRate * 100) / 100
    });

    previousUsers = users;
  }

  return funnelSteps;
}

/**
 * Create custom report
 */
export async function createCustomReport(
  config: CustomReportConfig,
  createdBy: string
) {
  const report = await prisma.customReport.create({
    data: {
      ...config,
      createdBy,
      query: JSON.stringify(config.query),
      filters: config.filters ? JSON.stringify(config.filters) : null
    }
  });

  return report;
}

/**
 * Get custom reports
 */
export async function getCustomReports(
  page: number = 1,
  limit: number = 20,
  isPublic?: boolean
) {
  const skip = (page - 1) * limit;
  const where: Prisma.CustomReportWhereInput = {};
  
  if (isPublic !== undefined) {
    where.isPublic = isPublic;
  }

  const [reports, total] = await prisma.$transaction([
    prisma.customReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.customReport.count({ where })
  ]);

  return {
    reports: reports.map(report => ({
      ...report,
      query: JSON.parse(report.query),
      filters: report.filters ? JSON.parse(report.filters) : null
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Execute custom report
 */
export async function executeCustomReport(reportId: string) {
  const report = await prisma.customReport.findUnique({
    where: { id: reportId }
  });

  if (!report) {
    throw new CustomError('Report not found', 404);
  }

  const query = JSON.parse(report.query);
  const filters = report.filters ? JSON.parse(report.filters) : {};

  // This is a simplified implementation
  // In a real application, you would have a more sophisticated query builder
  let data: unknown[] = [];

  if (query.type === 'orders') {
    data = await prisma.order.findMany({
      where: {
        paymentStatus: 'paid',
        ...filters
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: query.orderBy || { createdAt: 'desc' },
      take: query.limit || 100
    });
  } else if (query.type === 'products') {
    data = await prisma.product.findMany({
      where: filters,
      include: {
        variants: true,
        reviews: true
      },
      orderBy: query.orderBy || { createdAt: 'desc' },
      take: query.limit || 100
    });
  } else if (query.type === 'customers') {
    data = await prisma.user.findMany({
      where: {
        role: 'customer',
        ...filters
      },
      include: {
        orders: {
          where: {
            paymentStatus: 'paid'
          }
        }
      },
      orderBy: query.orderBy || { createdAt: 'desc' },
      take: query.limit || 100
    });
  }

  return {
    report: {
      ...report,
      query: JSON.parse(report.query),
      filters: report.filters ? JSON.parse(report.filters) : null
    },
    data
  };
}

/**
 * Get analytics dashboard data
 */
export async function getAnalyticsDashboard() {
  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue,
    topProducts,
    recentOrders,
    customerSegments
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { totalAmount: true }
    }),
    prisma.order.count({
      where: { paymentStatus: 'paid' }
    }),
    prisma.user.count({
      where: { role: 'customer' }
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _avg: { totalAmount: true }
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        reviews: true
      }
    }),
    prisma.order.findMany({
      take: 10,
      where: { paymentStatus: 'paid' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.customerLifetimeValue.groupBy({
      by: ['segment'],
      _count: {
        segment: true
      }
    })
  ]);

  return {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalOrders,
    totalCustomers,
    averageOrderValue: Math.round(averageOrderValue._avg.totalAmount || 0),
    topProducts,
    recentOrders,
    customerSegments: customerSegments.map(segment => ({
      segment: segment.segment || 'unknown',
      count: segment._count.segment
    }))
  };
}
