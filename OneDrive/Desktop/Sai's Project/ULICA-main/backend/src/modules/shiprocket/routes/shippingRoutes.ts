import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middlewares/auth';
import {
  authenticateHandler,
  createOrderHandler,
  schedulePickupHandler,
  trackShipmentHandler,
  generateLabelHandler,
  createReturnHandler,
  webhookHandler,
  listOrdersHandler,
  eventsStreamHandler,
} from '../controllers/shippingController';

const router = Router();

// Admin protected routes
router.post('/auth/refresh', authenticateToken, requireAdmin, authenticateHandler);
router.get('/orders', authenticateToken, requireAdmin, listOrdersHandler);
router.post('/order/:id/create', authenticateToken, requireAdmin, createOrderHandler);
router.post('/order/:id/pickup', authenticateToken, requireAdmin, schedulePickupHandler);
router.get('/order/:awb/track', authenticateToken, requireAdmin, trackShipmentHandler);
router.get('/order/:id/label', authenticateToken, requireAdmin, generateLabelHandler);
router.post('/order/:id/return', authenticateToken, requireAdmin, createReturnHandler);
router.get('/events/stream', eventsStreamHandler);

// Webhook (public but validated)
router.post('/webhook', webhookHandler);

export default router;


