import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
} from '@/components/ui/icons';

export interface TrackingEvent {
  status: string;
  location?: string | null;
  remarks?: string | null;
  timestamp?: string | null;
}

interface TrackingStatusProps {
  currentStatus: string;
  events: TrackingEvent[];
}

const STATUS_FLOW = [
  { id: 'pending', label: 'Order Placed', icon: ClockIcon },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
  { id: 'pickup_scheduled', label: 'Pickup Scheduled', icon: MapPinIcon },
  { id: 'picked', label: 'Picked Up', icon: TruckIcon },
  { id: 'in_transit', label: 'In Transit', icon: TruckIcon },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: TruckIcon },
  { id: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
  { id: 'return_initiated', label: 'Return Initiated', icon: ClockIcon },
  { id: 'returned', label: 'Returned', icon: CheckCircleIcon },
];

function normalizeStatus(status: string) {
  return status?.toLowerCase().replace(/\s+/g, '_');
}

export function TrackingStatus({ currentStatus, events }: TrackingStatusProps) {
  const normalized = normalizeStatus(currentStatus);
  const completedIndex = STATUS_FLOW.findIndex((step) => normalized === step.id);
  const reachedIndex = completedIndex === -1 ? 0 : completedIndex;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Tracking progress
        </h3>
        <ol className="flex flex-col gap-3">
          {STATUS_FLOW.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= reachedIndex;
            const isCurrent = index === reachedIndex;

            return (
              <li
                key={step.id}
                className={`rounded-xl border p-3.5 transition ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isCurrent ? 'Current status' : isCompleted ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Timeline
        </h3>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No tracking events reported yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {event.status.replace(/_/g, ' ').toUpperCase()}
                </p>
                {event.location && (
                  <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                )}
                {event.remarks && (
                  <p className="text-xs text-gray-500 mt-1">{event.remarks}</p>
                )}
                {event.timestamp && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

