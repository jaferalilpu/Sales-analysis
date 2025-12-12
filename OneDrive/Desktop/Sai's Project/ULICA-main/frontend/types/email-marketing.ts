/**
 * Email marketing-related types for frontend
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  recipientList: string[];
  scheduledAt?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

