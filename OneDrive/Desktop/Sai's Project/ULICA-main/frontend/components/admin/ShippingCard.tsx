import {
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  ClipboardDocumentIcon,
  MapPinIcon,
  TruckIcon,
} from '@/components/ui/icons';
import { ReactNode } from 'react';

type ActionKey = 'create' | 'pickup' | 'label' | 'track' | 'return';

export interface ShippingOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  courierName?: string | null;
  awbNumber?: string | null;
  labelUrl?: string | null;
  pickupStatus?: string | null;
  trackingUrl?: string | null;
  isReturned: boolean;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail?: string | null;
  shippingAddress?: {
    name?: string | null;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country?: string | null;
    phone?: string | null;
  } | null;
  shipmentLogs: Array<{
    id: string;
    status: string;
    message?: string | null;
    createdAt: string;
  }>;
}

interface ShippingCardProps {
  order: ShippingOrderSummary;
  onCreateShipment: () => void;
  onSchedulePickup: () => void;
  onGenerateLabel: () => void;
  onTrackShipment: () => void;
  onReturnShipment: () => void;
  disabled?: Partial<Record<ActionKey, boolean>>;
  extraContent?: ReactNode;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-sky-100 text-sky-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  returned: 'bg-orange-100 text-orange-800',
};

export function ShippingCard({
  order,
  onCreateShipment,
  onSchedulePickup,
  onGenerateLabel,
  onTrackShipment,
  onReturnShipment,
  disabled,
  extraContent,
}: ShippingCardProps) {
  const canCreate = !order.awbNumber;
  const canPickup = !!order.awbNumber;
  const canLabel = !!order.awbNumber;
  const canTrack = !!order.awbNumber;
  const canReturn = order.status === 'delivered' && !order.isReturned;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order #{order.orderNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
              }`}
          >
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Shipment details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1.5">
              <p className="text-gray-500">Courier</p>
              <p className="font-medium text-gray-900">{order.courierName ?? 'Not assigned'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-gray-500">AWB Number</p>
              <p className="font-medium text-gray-900">
                {order.awbNumber ?? 'Not generated'}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-gray-500">Pickup Status</p>
              <p className="font-medium text-gray-900">
                {order.pickupStatus?.replace(/_/g, ' ') ?? 'Not scheduled'}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-gray-500">Tracking URL</p>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center gap-1"
                >
                  Track shipment
                  <ArrowUpOnSquareIcon className="h-4 w-4" />
                </a>
              ) : (
                <p className="font-medium text-gray-900">Not available</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Shipping address
          </h3>
          {order.shippingAddress ? (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.name || order.customerName}
                  </p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.pincode}
                  </p>
                  <p>{order.shippingAddress.country ?? 'India'}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-gray-500">+91 {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No shipping address available.</p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionButton
              icon={TruckIcon}
              label="Create Shipment"
              description="Send order to Shiprocket and generate AWB."
              disabled={!canCreate || disabled?.create}
              onClick={onCreateShipment}
            />
            <ActionButton
              icon={ClipboardDocumentIcon}
              label="Generate Label"
              description="Download and print shipping label."
              disabled={!canLabel || disabled?.label}
              onClick={onGenerateLabel}
            />
            <ActionButton
              icon={ArrowPathIcon}
              label="Schedule Pickup"
              description="Arrange pickup with assigned courier."
              disabled={!canPickup || disabled?.pickup}
              onClick={onSchedulePickup}
            />
            <ActionButton
              icon={MapPinIcon}
              label="Track Shipment"
              description="View real-time shipment updates."
              disabled={!canTrack || disabled?.track}
              onClick={onTrackShipment}
            />
            <ActionButton
              icon={ArrowUpOnSquareIcon}
              label="Initiate Return"
              description="Create Shiprocket return order."
              disabled={!canReturn || disabled?.return}
              onClick={onReturnShipment}
            />
          </div>
        </section>

        {extraContent}

        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Shipment activity
          </h3>
          {order.shipmentLogs.length === 0 ? (
            <p className="text-sm text-gray-500">No shipment activity logged yet.</p>
          ) : (
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {order.shipmentLogs.map((log) => (
                <div key={log.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {log.status.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  {log.message && <p className="text-gray-600 mt-1">{log.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

function ActionButton({ icon: Icon, label, description, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left p-4 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
        disabled
          ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full ${
            disabled ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}

