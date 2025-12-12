import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  authenticateShiprocket,
  createShiprocketOrder,
  schedulePickup,
  trackShipment,
  generateLabel,
  createReturnOrder,
  handleWebhook,
  listShippingOrders,
} from '../services/shippingService';
import { shipmentEvents } from '../utils/eventBus';

export async function authenticateHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = await authenticateShiprocket(true);
    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
}

export async function createOrderHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createShiprocketOrder(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function schedulePickupHandler(
  req: Request<{ id: string }, unknown, { pickupDate?: string; pickupTime?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await schedulePickup(req.params.id, {
      ...(req.body?.pickupDate ? { pickupDate: req.body.pickupDate } : {}),
      ...(req.body?.pickupTime ? { pickupTime: req.body.pickupTime } : {}),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function trackShipmentHandler(
  req: Request<{ awb: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await trackShipment(req.params.awb);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function generateLabelHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await generateLabel(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createReturnHandler(
  req: Request<{ id: string }, unknown, { reason?: string; pickupLocation?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await createReturnOrder(req.params.id, {
      reason: req.body?.reason ?? undefined,
      pickupLocation: req.body?.pickupLocation ?? undefined,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function webhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const providedSecret =
      (req.headers['x-shiprocket-token'] as string | undefined) ??
      (req.headers['x-shiprocket-secret'] as string | undefined);

    const webhookSecret = process.env['SHIPROCKET_WEBHOOK_SECRET'];
    if (webhookSecret) {
      if (!providedSecret || providedSecret !== webhookSecret) {
        res.status(401).json({ success: false, error: 'Unauthorized webhook' });
        return;
      }
    }

    await handleWebhook(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listOrdersHandler(
  req: Request<unknown, unknown, unknown, { status?: string; search?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await listShippingOrders({
      status: req.query.status ? String(req.query.status) : undefined,
      search: req.query.search ? String(req.query.search) : undefined,
    });
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
}

export function eventsStreamHandler(req: Request, res: Response): void {
  // Only use Authorization header (no query tokens for security)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Fallback to httpOnly cookie if available
  const cookieToken = (req as any).cookies?.accessToken;
  const finalToken = token ?? cookieToken;

  if (!finalToken) {
    res.status(401).json({ success: false, error: 'Unauthorized - Token required in Authorization header or cookie' });
    return;
  }

  try {
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const decoded: any = jwt.verify(finalToken, jwtSecret);

    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const statusListener = (data: any) => sendEvent('status', data);
  const labelListener = (data: any) => sendEvent('label', data);

  shipmentEvents.on('statusUpdate', statusListener);
  shipmentEvents.on('labelReady', labelListener);

  req.on('close', () => {
    shipmentEvents.off('statusUpdate', statusListener);
    shipmentEvents.off('labelReady', labelListener);
  });

  sendEvent('connected', { timestamp: new Date().toISOString() });
}


