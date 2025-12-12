// @ts-nocheck
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export interface CreateTicketData {
  userId?: string;
  email: string;
  subject: string;
  description: string;
  category?: string;
  priority?: string;
}

export interface UpdateTicketData {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}

export interface CreateResponseData {
  ticketId: string;
  userId?: string;
  message: string;
  isInternal?: boolean;
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(data: CreateTicketData) {
  const { userId, email, subject, description, category = 'general', priority = 'medium' } = data;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      email,
      subject,
      description,
      category,
      priority
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return ticket;
}

/**
 * Get support tickets with pagination and filters
 */
export async function getSupportTickets(
  page: number = 1,
  limit: number = 10,
  filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    search?: string;
  } = {}
) {
  const skip = (page - 1) * limit;
  const where: Prisma.SupportTicketWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.category) where.category = filters.category;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;
  if (filters.search) {
    where.OR = [
      { subject: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { ticketNumber: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const [tickets, total] = await prisma.$transaction([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.supportTicket.count({ where })
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get a single support ticket by ID
 */
export async function getSupportTicket(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      responses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  return ticket;
}

/**
 * Update support ticket
 */
export async function updateSupportTicket(ticketId: string, data: UpdateTicketData) {
  const { status, priority, category, assignedTo } = data;

  const updateData: Prisma.SupportTicketUpdateInput = {};
  if (status) updateData.status = status;
  if (priority) updateData.priority = priority;
  if (category) updateData.category = category;
  if (assignedTo) updateData.assignedTo = assignedTo;

  if (status === 'resolved' || status === 'closed') {
    updateData.resolvedAt = new Date();
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return ticket;
}

/**
 * Add response to support ticket
 */
export async function addTicketResponse(data: CreateResponseData) {
  const { ticketId, userId, message, isInternal = false } = data;

  // Check if ticket exists
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId }
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  // Create response
  const response = await prisma.supportTicketResponse.create({
    data: {
      ticketId,
      userId,
      message,
      isInternal
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Update ticket status if it's a customer response
  if (!isInternal && ticket.status === 'closed') {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'open' }
    });
  }

  return response;
}

/**
 * Get support ticket statistics
 */
export async function getSupportStats() {
  const [
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    recentTickets
  ] = await Promise.all([
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: 'open' } }),
    prisma.supportTicket.count({ where: { status: 'in_progress' } }),
    prisma.supportTicket.count({ where: { status: 'resolved' } }),
    prisma.supportTicket.count({ where: { status: 'closed' } }),
    prisma.supportTicket.count({ where: { priority: 'urgent' } }),
    prisma.supportTicket.findMany({
      where: {
        status: { in: ['open', 'in_progress'] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    recentTickets,
    resolutionRate: totalTickets > 0 ? (((resolvedTickets + closedTickets) / totalTickets) * 100).toFixed(2) : 0
  };
}

/**
 * Get tickets by customer
 */
export async function getCustomerTickets(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [tickets, total] = await prisma.$transaction([
    prisma.supportTicket.findMany({
      where: { userId },
      include: {
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.supportTicket.count({ where: { userId } })
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Assign ticket to admin user
 */
export async function assignTicket(ticketId: string, assignedTo: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { 
      assignedTo,
      status: 'in_progress'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return ticket;
}

/**
 * Close ticket
 */
export async function closeTicket(ticketId: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { 
      status: 'closed',
      resolvedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return ticket;
}
