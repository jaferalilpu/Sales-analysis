/**
 * Support ticket types for frontend
 */

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    responses: number;
  };
}

export interface SupportTicketFormData {
  subject: string;
  description: string;
  category?: string;
  priority?: string;
}

