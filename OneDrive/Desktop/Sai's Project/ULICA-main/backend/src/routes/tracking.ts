import * as express from 'express';
import { asyncHandler, CustomError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { getRealTimeTracking, generateEnhancedShippingLabel } from '../services/shiprocketService';
import { logger } from '../services/loggerService';
import { ExpressResponse } from '../types/express';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const trackShipmentSchema = {
  params: Joi.object({
    awbCode: Joi.string().required()
  })
};

const generateLabelSchema = {
  params: Joi.object({
    shipmentId: Joi.string().required()
  })
};

/**
 * GET /api/tracking/:awbCode
 * Track shipment with real-time updates
 */
router.get('/:awbCode',
  authenticateToken,
  validate(trackShipmentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const awbCode = req.params['awbCode'];
    if (!awbCode) {
      throw new CustomError('AWB code is required', 400);
    }

    try {
      const trackingResult = await getRealTimeTracking(awbCode);

      if (trackingResult.success) {
        res.json({
          success: true,
          data: trackingResult.data
        });
      } else {
        throw new CustomError(trackingResult.error || 'Tracking failed', 400);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Tracking error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to track shipment', 500);
    }
  })
);

/**
 * GET /api/tracking/label/:shipmentId
 * Generate enhanced shipping label
 */
router.get('/label/:shipmentId',
  authenticateToken,
  validate(generateLabelSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const shipmentId = req.params['shipmentId'];
    if (!shipmentId) {
      throw new CustomError('Shipment ID is required', 400);
    }

    try {
      const labelResult = await generateEnhancedShippingLabel(shipmentId);

      if (labelResult.success) {
        res.json({
          success: true,
          data: labelResult.data
        });
      } else {
        throw new CustomError(labelResult.error || 'Label generation failed', 400);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Label generation error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to generate shipping label', 500);
    }
  })
);

/**
 * GET /api/tracking/status/:awbCode
 * Get quick status check
 */
router.get('/status/:awbCode',
  authenticateToken,
  validate(trackShipmentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: ExpressResponse) => {
    const awbCode = req.params['awbCode'];
    if (!awbCode) {
      throw new CustomError('AWB code is required', 400);
    }

    try {
      const trackingResult = await getRealTimeTracking(awbCode);

      if (trackingResult.success && trackingResult.data) {
        res.json({
          success: true,
          data: {
            awbCode: trackingResult.data.awbCode,
            status: trackingResult.data.currentStatus,
            courierName: trackingResult.data.courierName,
            estimatedDelivery: trackingResult.data.estimatedDelivery
          }
        });
      } else {
        throw new CustomError(trackingResult.error || 'Status check failed', 400);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Status check error', { error: errorMsg }).catch(() => {});
      throw new CustomError('Failed to check shipment status', 500);
    }
  })
);

export default router;
