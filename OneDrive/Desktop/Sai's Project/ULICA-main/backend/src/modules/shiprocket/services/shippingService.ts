import { AxiosError } from 'axios';
import { OrderStatus } from '@prisma/client';
import prisma from '../../../prisma/client';
import { logger } from '../../../services/loggerService';
import { shiprocketRequest } from './apiClient';
import { authenticate } from './authService';
import { ensureCredentials, ShiprocketConfig, resolveConfig } from '../utils/config';
import { mapOrderToShiprocketPayload } from '../utils/orderMapper';
import { mapShiprocketStatus } from '../utils/statusMapper';
import { shipmentEvents } from '../utils/eventBus';
import { transitionOrderStatus } from '../../../services/orderStatusService';

type ShiprocketResponse = Record<string, any>;

interface ReturnOptions {
  reason?: string | undefined;
  pickupLocation?: string | undefined;
}

function buildTrackingUrl(awb?: string | null): string | null {
  if (!awb) return null;
  return `https://www.shiprocket.in/shipment-tracking/${encodeURIComponent(awb)}`;
}

function isAxiosError(error: unknown): error is AxiosError {
  return !!(error as AxiosError)?.isAxiosError;
}

function extractError(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (typeof responseData === 'string') return responseData;
    if (responseData && typeof responseData === 'object') {
      return JSON.stringify(responseData);
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

const SHIPROCKET_TO_ORDER_STATUS: Record<string, OrderStatus> = {
  pending: 'pending',
  confirmed: 'confirmed',
  processing: 'processing',
  pickup_scheduled: 'processing',
  picked: 'processing',
  in_transit: 'shipped',
  out_for_delivery: 'shipped',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  return_initiated: 'returned',
  return_pickup: 'returned',
  return_picked: 'returned',
  returned: 'returned',
};

function resolveOrderStatusFromShiprocket(status?: string | null): OrderStatus | null {
  if (!status) return null;
  const normalized = mapShiprocketStatus(status);
  return SHIPROCKET_TO_ORDER_STATUS[normalized] ?? null;
}

async function syncOrderStatusFromShiprocket(
  orderId: string,
  status?: string | null
): Promise<OrderStatus | null> {
  const mapped = resolveOrderStatusFromShiprocket(status);
  if (!mapped) {
    return null;
  }

  try {
    const updated = await transitionOrderStatus(orderId, mapped);
    return updated.status as OrderStatus;
  } catch (error: any) {
    await logger.warn('Shiprocket status transition blocked', {
      orderId,
      requestedStatus: mapped,
      error: error?.message ?? String(error),
    });
    return null;
  }
}

export async function authenticateShiprocket(force = false, overrides?: Partial<ShiprocketConfig>): Promise<string> {
  const config = await ensureCredentials(false, overrides);
  if (!config) {
    throw new Error('Shiprocket credentials missing. Configure credentials to enable shipping.');
  }
  return authenticate(force);
}

export async function createShiprocketOrder(orderId: string) {
  await ensureCredentials();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      addresses: true,
      items: {
        include: {
          product: { select: { title: true, sku: true } },
          variant: { select: { sku: true, title: true, weight: true } },
        },
      },
      user: {
        select: { email: true, phone: true },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.addresses || order.addresses.length === 0) {
    throw new Error('Order does not have address information');
  }

  const config = await resolveConfig();
  const payloadOptions: {
    paymentMethod?: string;
    subtotal?: number;
    config?: ShiprocketConfig;
  } = {
    paymentMethod: order.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
    subtotal: order.totalAmount ?? order.subtotal ?? 0,
  };

  if (config) {
    payloadOptions.config = config;
  }

  const payload = mapOrderToShiprocketPayload(order, payloadOptions);

  if (order.user?.email) {
    payload.billing_email = order.user.email;
  }
  if (order.user?.phone) {
    payload.billing_phone = order.user.phone;
  }

  try {
    const response = await shiprocketRequest<ShiprocketResponse>('/orders/create/adhoc', {
      method: 'POST',
      data: payload,
    });

    const data = (response.data || {}) as any;
    const shipmentId =
      data['shipment_id'] ?? data['data']?.['shipment_id'] ?? data['order_id'] ?? data['data']?.['order_id'];
    const awb =
      data['awb'] ?? data['awb_code'] ?? data['data']?.['awb'] ?? data['data']?.['awb_code'] ?? null;
    const courierName =
      data['courier_company'] ?? data['courier_company_id'] ?? data['courier_name'] ?? data['data']?.['courier_name'] ?? null;
    const status = mapShiprocketStatus(data['current_status'] ?? data['status'] ?? 'confirmed');
    const trackingUrl = data['tracking_url'] ?? buildTrackingUrl(awb);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        courierName: courierName ?? order.courierName,
        awbNumber: awb ?? order.awbNumber,
        trackingUrl: trackingUrl ?? order.trackingUrl,
        shiprocketShipmentId: shipmentId ? String(shipmentId) : order.shiprocketShipmentId,
        shipmentLogs: {
          create: {
            status: 'shipment_created',
            message: 'Shiprocket order created',
            payload: data,
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        courierName: true,
        awbNumber: true,
        trackingUrl: true,
        status: true,
        shiprocketShipmentId: true,
      },
    });

    const finalStatus =
      (await syncOrderStatusFromShiprocket(order.id, status)) ?? updatedOrder.status;

    shipmentEvents.emit('statusUpdate', {
      orderId: updatedOrder.id,
      awb: updatedOrder.awbNumber ?? awb ?? '',
      status: finalStatus,
      trackingUrl: updatedOrder.trackingUrl ?? trackingUrl ?? null,
      timestamp: new Date().toISOString(),
    });

    await logger.info('Shiprocket order created', {
      orderId: order.id,
      shipmentId,
      awb,
    });

    return {
      order: { ...updatedOrder, status: finalStatus },
      shiprocket: {
        shipmentId,
        awb,
        courierName,
        trackingUrl,
        raw: data,
      },
    };
  } catch (error) {
    const errorMessage = extractError(error);
    await logger.error('Shiprocket order creation failed', {
      orderId,
      error: errorMessage,
    });

    throw new Error(`Failed to create Shiprocket order: ${errorMessage}`);
  }
}

export async function schedulePickup(
  orderId: string,
  options: { pickupDate?: string; pickupTime?: string } = {}
) {
  await ensureCredentials();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { shiprocketShipmentId: true, awbNumber: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.shiprocketShipmentId) {
    throw new Error('Order has no Shiprocket shipment ID');
  }

  const payload = {
    shipment_id: [Number(order.shiprocketShipmentId)],
    pickup_date: options.pickupDate,
    pickup_time: options.pickupTime,
  };

  try {
    const response = await shiprocketRequest<ShiprocketResponse>('/courier/generate/pickup', {
      method: 'POST',
      data: payload,
    });

    const data = (response.data ?? {}) as any;
    const pickupStatus =
      data['pickup_status'] ?? data['status'] ?? 'pickup_scheduled';

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        pickupStatus,
        shipmentLogs: {
          create: {
            status: 'pickup_scheduled',
            message: `Pickup scheduled${options.pickupDate ? ` for ${options.pickupDate}` : ''}`,
            payload: data,
          },
        },
      },
      select: {
        id: true,
        pickupStatus: true,
        awbNumber: true,
      },
    });

    await logger.info('Shiprocket pickup scheduled', {
      orderId,
      shipmentId: order.shiprocketShipmentId,
      pickupStatus,
    });

    return {
      order: updatedOrder,
      shiprocket: data,
    };
  } catch (error) {
    const message = extractError(error);
    await logger.error('Shiprocket pickup scheduling failed', {
      orderId,
      error: message,
    });
    throw new Error(`Failed to schedule pickup: ${message}`);
  }
}

export async function trackShipment(awb: string) {
  await ensureCredentials();
  if (!awb) {
    throw new Error('AWB number is required');
  }

  try {
    const response = await shiprocketRequest<ShiprocketResponse>(`/courier/track/awb/${awb}`);
    const root = (response.data ?? {}) as any;
    const data =
      root['tracking_data'] ??
      root['data'] ??
      root;

    const shipmentEventsList =
      data?.['shipment_track'] ??
      data?.['shipment_track_activities'] ??
      data?.['tracking_data'] ??
      [];

    const order = await prisma.order.findFirst({
      where: { awbNumber: awb },
      select: { id: true },
    });

    const status = mapShiprocketStatus(data?.['current_status'] ?? data?.['status']);

    if (order) {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingUrl: data?.['tracking_url'] ?? buildTrackingUrl(awb),
          shipmentLogs: {
            create: {
              status: 'tracking_sync',
              message: `Tracking refreshed: ${status}`,
              payload: data,
            },
          },
        },
        select: {
          id: true,
          status: true,
          trackingUrl: true,
        },
      });

      const finalStatus =
        (await syncOrderStatusFromShiprocket(order.id, status)) ?? updatedOrder.status;

      shipmentEvents.emit('statusUpdate', {
        orderId: order.id,
        awb,
        status: finalStatus,
        trackingUrl: updatedOrder.trackingUrl ?? buildTrackingUrl(awb),
        timestamp: new Date().toISOString(),
      });
    }

    return {
      awb,
        courierName: data?.['courier_name'],
      status,
        trackingUrl: data?.['tracking_url'] ?? buildTrackingUrl(awb),
        estimatedDelivery: data?.['etd'],
      events: shipmentEventsList.map((event: any) => ({
        status: mapShiprocketStatus(event?.current_status ?? event?.activity),
        location: event?.location,
        remarks: event?.remarks ?? event?.activity,
        timestamp: event?.date ?? event?.event_time,
      })),
      raw: data,
    };
  } catch (error) {
    const message = extractError(error);
    await logger.error('Shiprocket tracking failed', { awb, error: message });
    throw new Error(`Failed to track shipment: ${message}`);
  }
}

export async function generateLabel(orderId: string) {
  await ensureCredentials();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      shiprocketShipmentId: true,
      awbNumber: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.shiprocketShipmentId) {
    throw new Error('Shipment ID not available for this order');
  }

  try {
    const response = await shiprocketRequest<ShiprocketResponse>('/courier/generate/label', {
      method: 'POST',
      data: { shipment_id: [Number(order.shiprocketShipmentId)] },
    });

    const root = (response.data ?? {}) as any;
    const labelUrl =
      root['label_url'] ??
      root['data']?.['label_url'] ??
      root['label_url_list']?.[0]?.['label_url'] ??
      null;

    if (!labelUrl) {
      throw new Error('Label URL not returned from Shiprocket');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        labelUrl,
        shipmentLogs: {
          create: {
            status: 'label_generated',
            message: 'Shipping label generated',
            payload: response.data,
          },
        },
      },
    });

    shipmentEvents.emit('labelReady', {
      orderId,
      labelUrl,
    });

    await logger.info('Shiprocket label generated', {
      orderId,
      shipmentId: order.shiprocketShipmentId,
      labelUrl,
    });

    return { labelUrl, raw: response.data };
  } catch (error) {
    const message = extractError(error);
    await logger.error('Shiprocket label generation failed', {
      orderId,
      error: message,
    });

    throw new Error(`Failed to generate label: ${message}`);
  }
}

export async function createReturnOrder(orderId: string, options: ReturnOptions = {}) {
  await ensureCredentials();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      addresses: true,
      items: {
        include: {
          product: { select: { title: true, sku: true } },
          variant: { select: { sku: true } },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.awbNumber) {
    throw new Error('Order does not have an AWB number');
  }

  const config = await resolveConfig();
  const payload = {
    awb_number: order.awbNumber!,
    reason: options.reason ?? 'Customer requested return',
    pickup_location: options.pickupLocation ?? config?.pickupLocation ?? 'Primary',
  };

  try {
    const response = await shiprocketRequest<ShiprocketResponse>('/orders/create/return', {
      method: 'POST',
      data: payload,
    });

    const data = (response.data ?? {}) as any;
    const status = mapShiprocketStatus(data['current_status'] ?? 'return_initiated');

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        isReturned: true,
        shipmentLogs: {
          create: {
            status: 'return_initiated',
            message: `Return initiated${options.reason ? `: ${options.reason}` : ''}`,
            payload: data,
          },
        },
      },
      select: { id: true, status: true, isReturned: true },
    });

    const finalStatus =
      (await syncOrderStatusFromShiprocket(order.id, status)) ?? updatedOrder.status;

    shipmentEvents.emit('statusUpdate', {
      orderId: order.id,
      awb: order.awbNumber,
      status: finalStatus,
      timestamp: new Date().toISOString(),
    });

    await logger.info('Shiprocket return initiated', {
      orderId,
      awb: order.awbNumber,
      status: updatedOrder.status,
    });

    return {
      order: updatedOrder,
      shiprocket: data,
    };
  } catch (error) {
    const message = extractError(error);
    await logger.error('Shiprocket return creation failed', {
      orderId,
      error: message,
    });
    throw new Error(`Failed to create return order: ${message}`);
  }
}

interface ShiprocketWebhookPayload {
  awb?: string;
  current_status?: string;
  current_timestamp?: string;
  remarks?: string;
  courier_name?: string;
  shipment_id?: string | number;
  [key: string]: any;
}

export async function handleWebhook(payload: ShiprocketWebhookPayload) {
  if (!payload?.awb) {
    throw new Error('Webhook payload missing AWB');
  }

  const order = await prisma.order.findFirst({
    where: { awbNumber: payload.awb },
    select: {
      id: true,
      status: true,
    },
  });

  if (!order) {
    await logger.warn('Shiprocket webhook: order not found for AWB', {
      awb: payload.awb,
      payload,
    });
    return { success: false, message: 'Order not found for AWB' };
  }

  const status = mapShiprocketStatus(payload.current_status);

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      ...(payload.courier_name ? { courierName: payload.courier_name } : {}),
      awbNumber: payload.awb,
      ...(payload.shipment_id ? { shiprocketShipmentId: String(payload.shipment_id) } : {}),
      ...(status.includes('return') || status === 'returned' ? { isReturned: true } : {}),
      shipmentLogs: {
        create: {
          status,
          message: payload.remarks ?? payload.current_status ?? 'Status update received',
          payload,
        },
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  const finalStatus =
    (await syncOrderStatusFromShiprocket(order.id, status)) ?? updatedOrder.status;

  shipmentEvents.emit('statusUpdate', {
    orderId: order.id,
    awb: payload.awb,
    status: finalStatus,
    timestamp: payload.current_timestamp ?? new Date().toISOString(),
  });

  await logger.info('Shiprocket webhook processed', {
    orderId: order.id,
    awb: payload.awb,
    status,
  });

  return { success: true };
}

export async function ensureShiprocketShipmentArtifacts(orderId: string) {
  try {
    await ensureCredentials();
  } catch (error) {
    await logger.warn('Shiprocket credentials not configured; skipping auto provisioning', {
      orderId,
      error: extractError(error),
    });
    return {
      shipmentCreated: false,
      labelGenerated: false,
      labelUrl: null as string | null,
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      paymentStatus: true,
      shiprocketShipmentId: true,
      labelUrl: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus !== 'paid') {
    return {
      shipmentCreated: false,
      labelGenerated: Boolean(order.labelUrl),
      labelUrl: order.labelUrl,
    };
  }

  let shipmentCreated = false;
  let labelGenerated = Boolean(order.labelUrl);

  if (!order.shiprocketShipmentId) {
    try {
      await createShiprocketOrder(orderId);
      shipmentCreated = true;
    } catch (error) {
      await logger.warn('Automatic Shiprocket order creation failed', {
        orderId,
        error: extractError(error),
      });
    }
  }

  const latest = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      shiprocketShipmentId: true,
      labelUrl: true,
    },
  });

  if (latest?.shiprocketShipmentId && !latest.labelUrl) {
    try {
      const label = await generateLabel(orderId);
      labelGenerated = Boolean(label?.labelUrl);
    } catch (error) {
      await logger.warn('Automatic Shiprocket label generation failed', {
        orderId,
        error: extractError(error),
      });
    }
  } else if (latest?.labelUrl) {
    labelGenerated = true;
  }

  return {
    shipmentCreated,
    labelGenerated,
    labelUrl: latest?.labelUrl ?? order.labelUrl ?? null,
  };
}

interface ShippingOrderFilter {
  status?: string | undefined;
  search?: string | undefined;
}

export async function listShippingOrders(filter: ShippingOrderFilter = {}) {
  const whereClause: any = {};

  if (filter.status && filter.status !== 'all') {
    const mappedStatus = resolveOrderStatusFromShiprocket(filter.status);
    if (mappedStatus) {
      whereClause.status = mappedStatus;
    }
  }

  if (filter.search) {
    whereClause.OR = [
      { orderNumber: { contains: filter.search, mode: 'insensitive' } },
      {
        user: {
          OR: [
            { firstName: { contains: filter.search, mode: 'insensitive' } },
            { lastName: { contains: filter.search, mode: 'insensitive' } },
            { email: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
      },
      { awbNumber: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      addresses: true,
      shipmentLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          message: true,
          createdAt: true,
        },
      },
    },
  });

  return orders.map((order) => {
    const shippingAddress =
      order.addresses.find((addr) => addr.type === 'shipping') ?? order.addresses[0];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() || 'Customer',
      customerEmail: order.user?.email ?? null,
      status: order.status,
      courierName: order.courierName,
      awbNumber: order.awbNumber,
      labelUrl: order.labelUrl,
      pickupStatus: order.pickupStatus,
      trackingUrl: order.trackingUrl ?? buildTrackingUrl(order.awbNumber),
      isReturned: order.isReturned,
      shiprocketShipmentId: order.shiprocketShipmentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: shippingAddress
        ? {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country: shippingAddress.country,
            phone: shippingAddress.phone,
          }
        : null,
      shipmentLogs: order.shipmentLogs,
    };
  });
}


