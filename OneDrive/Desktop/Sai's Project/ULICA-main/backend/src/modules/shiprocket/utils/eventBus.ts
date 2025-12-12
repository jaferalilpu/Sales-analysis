import { EventEmitter } from 'events';

export const shipmentEvents = new EventEmitter();

export type ShipmentStatusEvent = {
  orderId: string;
  awb: string;
  status: string;
  timestamp: string;
};

export type ShipmentLabelEvent = {
  orderId: string;
  labelUrl?: string;
  labelData?: string;
};

shipmentEvents.setMaxListeners(50);


