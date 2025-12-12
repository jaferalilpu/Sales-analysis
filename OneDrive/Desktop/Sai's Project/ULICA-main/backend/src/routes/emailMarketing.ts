import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import Joi from 'joi';
import {
  createEmailTemplate,
  getEmailTemplates,
  sendTestEmail
} from '../services/emailService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/email/templates
 * Create email template
 */
router.post('/templates',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      name: Joi.string().required(),
      subject: Joi.string().required(),
      content: Joi.string().required(),
      category: Joi.string().required(),
      variables: Joi.array().items(Joi.string()).optional()
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const template = await createEmailTemplate({
      ...req.body,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template
    });
  })
);

/**
 * GET /api/email/templates
 * Get email templates
 */
router.get('/templates',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      category: Joi.string().optional()
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const { page, limit, category } = req.query;
    const result = await getEmailTemplates(page, limit, category);
    
    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * POST /api/email/test
 * Send test email
 */
router.post('/test',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      to: Joi.string().email().required(),
      subject: Joi.string().required(),
      content: Joi.string().required()
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const result = await sendTestEmail(req.body.to, req.body.subject, req.body.content);
    
    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/email/subscribers
 * Get email subscribers
 */
router.get('/subscribers',
  authenticateToken,
  requireAdmin,
  validate({
    query: Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(20),
      status: Joi.string().valid('active', 'unsubscribed', 'bounced').optional()
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const { page, limit, status } = req.query;
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const [subscribers, total] = await prisma.$transaction([
      prisma.emailSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.emailSubscriber.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

/**
 * POST /api/email/subscribe
 * Subscribe email
 */
router.post('/subscribe',
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().optional(),
      source: Joi.string().default('website')
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const { email, name } = req.body;
    
    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        isActive: true,
        firstName: name ? name.split(' ')[0] : undefined,
        lastName: name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : undefined
      },
      create: {
        email,
        firstName: name ? name.split(' ')[0] : undefined,
        lastName: name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : undefined,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: subscriber
    });
  })
);

/**
 * POST /api/email/unsubscribe
 * Unsubscribe email
 */
router.post('/unsubscribe',
  validate({
    body: Joi.object({
      email: Joi.string().email().required()
    })
  }),
  asyncHandler(async (req: any, res: any) => {
    const { email } = req.body;
    
    const subscriber = await prisma.emailSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: subscriber
    });
  })
);

export default router;