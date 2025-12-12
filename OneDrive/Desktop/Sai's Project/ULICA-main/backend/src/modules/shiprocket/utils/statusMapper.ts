const STATUS_MAP: Record<string, string> = {
  'NEW': 'pending',
  'CONFIRMED': 'confirmed',
  'PICKUP SCHEDULED': 'pickup_scheduled',
  'PICKED UP': 'picked',
  'IN TRANSIT': 'in_transit',
  'OUT FOR DELIVERY': 'out_for_delivery',
  'DELIVERED': 'delivered',
  'CANCELLED': 'cancelled',
  'RTO INITIATED': 'return_initiated',
  'RTO DELIVERED': 'returned',
  'RETURN INITIATED': 'return_initiated',
  'RETURN PICKUP SCHEDULED': 'return_pickup',
  'RETURN PICKED': 'return_picked',
  'RETURNED': 'returned',
};

export function mapShiprocketStatus(status: string | undefined | null): string {
  if (!status) return 'pending';

  const normalized = status.trim().toUpperCase();
  return STATUS_MAP[normalized] ?? normalized.toLowerCase().replace(/\s+/g, '_');
}

