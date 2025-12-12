// @ts-nocheck
import axios from 'axios';
import { logger } from './loggerService';

export interface EmailSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  unsubscribeRate?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class EmailMarketingService {
  private apiKey: string;
  private baseUrl: string;
  private provider: 'mailchimp' | 'sendgrid' | 'convertkit';

  constructor(provider: 'mailchimp' | 'sendgrid' | 'convertkit' = 'mailchimp') {
    this.provider = provider;
    
    switch (provider) {
      case 'mailchimp':
        this.apiKey = process.env.MAILCHIMP_API_KEY || '';
        this.baseUrl = process.env.MAILCHIMP_BASE_URL || '';
        break;
      case 'sendgrid':
        this.apiKey = process.env.SENDGRID_API_KEY || '';
        this.baseUrl = 'https://api.sendgrid.com/v3';
        break;
      case 'convertkit':
        this.apiKey = process.env.CONVERTKIT_API_KEY || '';
        this.baseUrl = 'https://api.convertkit.com/v3';
        break;
    }
  }

  async addSubscriber(subscriber: EmailSubscriber): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.addToMailchimp(subscriber);
        case 'sendgrid':
          return await this.addToSendGrid(subscriber);
        case 'convertkit':
          return await this.addToConvertKit(subscriber);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error adding subscriber', { error: error instanceof Error ? error.message : String(error), email });
      return false;
    }
  }

  async removeSubscriber(email: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.removeFromMailchimp(email);
        case 'sendgrid':
          return await this.removeFromSendGrid(email);
        case 'convertkit':
          return await this.removeFromConvertKit(email);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error removing subscriber', { error: error instanceof Error ? error.message : String(error), email });
      return false;
    }
  }

  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'recipientCount'>): Promise<EmailCampaign | null> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.createMailchimpCampaign(campaign);
        case 'sendgrid':
          return await this.createSendGridCampaign(campaign);
        case 'convertkit':
          return await this.createConvertKitCampaign(campaign);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error creating campaign', { error: error instanceof Error ? error.message : String(error), campaignName: campaign.name });
      return null;
    }
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.sendMailchimpCampaign(campaignId);
        case 'sendgrid':
          return await this.sendSendGridCampaign(campaignId);
        case 'convertkit':
          return await this.sendConvertKitCampaign(campaignId);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error sending campaign', { error: error instanceof Error ? error.message : String(error), campaignId });
      return false;
    }
  }

  async getCampaignStats(campaignId: string): Promise<Partial<EmailCampaign> | null> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.getMailchimpCampaignStats(campaignId);
        case 'sendgrid':
          return await this.getSendGridCampaignStats(campaignId);
        case 'convertkit':
          return await this.getConvertKitCampaignStats(campaignId);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error getting campaign stats', { error: error instanceof Error ? error.message : String(error), campaignId });
      return null;
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> {
    try {
      switch (this.provider) {
        case 'mailchimp':
          return await this.createMailchimpTemplate(template);
        case 'sendgrid':
          return await this.createSendGridTemplate(template);
        case 'convertkit':
          return await this.createConvertKitTemplate(template);
        default:
          throw new Error('Unsupported email marketing provider');
      }
    } catch (error) {
      await logger.error('Error creating template', { error: error instanceof Error ? error.message : String(error), templateName: template.name });
      return null;
    }
  }

  // Mailchimp specific methods
  private async addToMailchimp(subscriber: EmailSubscriber): Promise<boolean> {
    const listId = process.env.MAILCHIMP_LIST_ID || '';
    const response = await axios.post(
      `${this.baseUrl}/lists/${listId}/members`,
      {
        email_address: subscriber.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName || '',
          LNAME: subscriber.lastName || ''
        },
        tags: subscriber.tags || []
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.status === 200;
  }

  private async removeFromMailchimp(email: string): Promise<boolean> {
    const listId = process.env.MAILCHIMP_LIST_ID || '';
    const subscriberHash = Buffer.from(email.toLowerCase()).toString('base64');
    
    try {
      await axios.delete(
        `${this.baseUrl}/lists/${listId}/members/${subscriberHash}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
        return true; // Already unsubscribed
      }
      throw error;
    }
  }

  private async createMailchimpCampaign(campaign: Omit<EmailCampaign, 'id' | 'recipientCount'>): Promise<EmailCampaign | null> {
    const listId = process.env.MAILCHIMP_LIST_ID || '';
    const response = await axios.post(
      `${this.baseUrl}/campaigns`,
      {
        type: 'regular',
        recipients: {
          list_id: listId
        },
        settings: {
          subject_line: campaign.subject,
          from_name: process.env.MAILCHIMP_FROM_NAME || 'ULICA',
          reply_to: process.env.MAILCHIMP_REPLY_TO || 'noreply@ulica.com'
        },
        content_type: 'template',
        content: {
          html: campaign.content
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      ...campaign,
      recipientCount: 0
    };
  }

  private async sendMailchimpCampaign(campaignId: string): Promise<boolean> {
    await axios.post(
      `${this.baseUrl}/campaigns/${campaignId}/actions/send`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return true;
  }

  private async getMailchimpCampaignStats(campaignId: string): Promise<Partial<EmailCampaign> | null> {
    const response = await axios.get(
      `${this.baseUrl}/campaigns/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const campaign = response.data;
    return {
      recipientCount: campaign.recipients?.recipient_count || 0,
      openRate: campaign.report_summary?.opens_rate || 0,
      clickRate: campaign.report_summary?.clicks_rate || 0,
      unsubscribeRate: campaign.report_summary?.unsubscribed_rate || 0
    };
  }

  private async createMailchimpTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> {
    const response = await axios.post(
      `${this.baseUrl}/templates`,
      {
        name: template.name,
        html: template.content
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // SendGrid specific methods
  private async addToSendGrid(subscriber: EmailSubscriber): Promise<boolean> {
    const listId = process.env.SENDGRID_LIST_ID || '';
    await axios.post(
      `${this.baseUrl}/marketing/contacts`,
      {
        list_ids: [listId],
        contacts: [{
          email: subscriber.email,
          first_name: subscriber.firstName,
          last_name: subscriber.lastName,
          custom_fields: subscriber.customFields
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  }

  private async removeFromSendGrid(email: string): Promise<boolean> {
    await axios.delete(
      `${this.baseUrl}/marketing/contacts`,
      {
        data: {
          delete_all_contacts: false,
          contacts: [{ email }]
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  }

  private async createSendGridCampaign(campaign: Omit<EmailCampaign, 'id' | 'recipientCount'>): Promise<EmailCampaign | null> {
    const response = await axios.post(
      `${this.baseUrl}/marketing/campaigns`,
      {
        name: campaign.name,
        subject: campaign.subject,
        html_content: campaign.content,
        list_ids: [process.env.SENDGRID_LIST_ID || '']
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      ...campaign,
      recipientCount: 0
    };
  }

  private async sendSendGridCampaign(campaignId: string): Promise<boolean> {
    await axios.post(
      `${this.baseUrl}/marketing/campaigns/${campaignId}/schedules/now`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return true;
  }

  private async getSendGridCampaignStats(campaignId: string): Promise<Partial<EmailCampaign> | null> {
    const response = await axios.get(
      `${this.baseUrl}/marketing/campaigns/${campaignId}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const stats = response.data;
    return {
      recipientCount: stats.recipients || 0,
      openRate: stats.opens_rate || 0,
      clickRate: stats.clicks_rate || 0,
      unsubscribeRate: stats.unsubscribes_rate || 0
    };
  }

  private async createSendGridTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> {
    const response = await axios.post(
      `${this.baseUrl}/templates`,
      {
        name: template.name,
        generation: 'dynamic',
        html_content: template.content
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ConvertKit specific methods
  private async addToConvertKit(subscriber: EmailSubscriber): Promise<boolean> {
    await axios.post(
      `${this.baseUrl}/subscribers`,
      {
        api_key: this.apiKey,
        email: subscriber.email,
        first_name: subscriber.firstName,
        last_name: subscriber.lastName,
        tags: subscriber.tags || []
      }
    );
    return true;
  }

  private async removeFromConvertKit(email: string): Promise<boolean> {
    await axios.post(
      `${this.baseUrl}/unsubscribe`,
      {
        api_key: this.apiKey,
        email
      }
    );
    return true;
  }

  private async createConvertKitCampaign(campaign: Omit<EmailCampaign, 'id' | 'recipientCount'>): Promise<EmailCampaign | null> {
    const response = await axios.post(
      `${this.baseUrl}/broadcasts`,
      {
        api_key: this.apiKey,
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content
      }
    );

    return {
      id: response.data.broadcast.id,
      ...campaign,
      recipientCount: 0
    };
  }

  private async sendConvertKitCampaign(campaignId: string): Promise<boolean> {
    await axios.post(
      `${this.baseUrl}/broadcasts/${campaignId}/send`,
      {
        api_key: this.apiKey
      }
    );
    return true;
  }

  private async getConvertKitCampaignStats(campaignId: string): Promise<Partial<EmailCampaign> | null> {
    const response = await axios.get(
      `${this.baseUrl}/broadcasts/${campaignId}`,
      {
        params: { api_key: this.apiKey }
      }
    );

    const broadcast = response.data.broadcast;
    return {
      recipientCount: broadcast.recipients_count || 0,
      openRate: broadcast.opens_rate || 0,
      clickRate: broadcast.clicks_rate || 0,
      unsubscribeRate: broadcast.unsubscribes_rate || 0
    };
  }

  private async createConvertKitTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate | null> {
    const response = await axios.post(
      `${this.baseUrl}/forms`,
      {
        api_key: this.apiKey,
        name: template.name,
        html_content: template.content
      }
    );

    return {
      id: response.data.form.id,
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const emailMarketing = new EmailMarketingService();
