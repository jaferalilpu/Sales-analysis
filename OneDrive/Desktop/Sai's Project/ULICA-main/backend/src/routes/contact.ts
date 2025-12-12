import express from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import Joi from 'joi';
import { sendEmail } from '../services/emailService';
import { logger } from '../services/loggerService';
import { ExpressResponse } from '../types/express';

const router = express.Router();

/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/',
  validate({
    body: Joi.object({
      firstName: Joi.string().min(1).max(100).required(),
      lastName: Joi.string().min(1).max(100).required(),
      email: Joi.string().email().required(),
      subject: Joi.string().min(1).max(200).required(),
      message: Joi.string().min(10).max(2000).required(),
    })
  }),
  asyncHandler(async (req: express.Request, res: ExpressResponse) => {
    const { firstName, lastName, email, subject, message } = req.body;

    try {
      // Create contact form submission in database (if you have a Contact model)
      // For now, we'll just send the email

      // Send email to admin
      const adminEmail = process.env['ADMIN_EMAIL'] || 'ulicastreet25@gmail.com';
      const emailSubject = `Contact Form: ${subject}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #000; margin: 20px 0;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This email was sent from the contact form on your website.</p>
        </div>
      `;

      await sendEmail(
        adminEmail,
        emailSubject,
        emailHtml
      );

      // Optionally send confirmation email to user
      try {
        const confirmationHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for contacting ULICA</h2>
            <p>Dear ${firstName},</p>
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #666;">Your message:</p>
              <p style="white-space: pre-wrap; margin-top: 10px;">${message}</p>
            </div>
            <p>Best regards,<br>ULICA Team</p>
          </div>
        `;
        await sendEmail(
          email,
          'Thank you for contacting ULICA',
          confirmationHtml
        );
      } catch (emailError: unknown) {
        logger.error(
          'Failed to send confirmation email',
          emailError instanceof Error ? { error: emailError.message, stack: emailError.stack } : { error: String(emailError) },
          undefined,
          undefined,
          emailError instanceof Error ? emailError : undefined
        );
        // Don't fail the request if confirmation email fails
      }

      logger.info(`Contact form submitted by ${email} - Subject: ${subject}`);

      res.json({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.'
      });
    } catch (error: unknown) {
      logger.error(
        'Error processing contact form',
        error instanceof Error ? { error: error.message, stack: error.stack } : { error: String(error) },
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
      throw new Error('Failed to submit contact form. Please try again later.');
    }
  })
);

export default router;

