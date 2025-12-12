'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlassIcon, PrinterIcon } from '@/components/ui/icons';
import { ShippingCard, ShippingOrderSummary } from '@/components/admin/ShippingCard';
import { TrackingStatus, TrackingEvent } from '@/components/admin/TrackingStatus';
import { ReturnModal } from '@/components/admin/ReturnModal';
import { showToast } from '@/lib/toast';

type TrackingResponse = {
  status: string;
  events: TrackingEvent[];
  courierName?: string;
  trackingUrl?: string | null;
};

type ActionKey = 'create' | 'pickup' | 'label' | 'track' | 'return';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port === '3000' ? '5001' : window.location.port}` : ''}`
    : 'http://localhost:5001');

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<ShippingOrderSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [batchPrinting, setBatchPrinting] = useState(false);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingResponse>>({});
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const selectedOrder = useMemo(
    () => (selectedOrderId ? orders.find((order) => order.id === selectedOrderId) ?? null : null),
    [orders, selectedOrderId]
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedOrderIds((prev) =>
      prev.filter((id) => orders.some((order) => order.id === id))
    );
  }, [orders]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = orders.length;
    const selectedCount = selectedOrderIds.length;
    selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < total;
  }, [orders.length, selectedOrderIds]);

  const fetchOrders = useCallback(
    async (options?: { keepSelection?: boolean }) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        }

        const response = await fetch(
          `/api/admin/shiprocket/orders${params.toString() ? `?${params}` : ''}`,
          { cache: 'no-store' }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to fetch shipping orders');
        }

        const list: ShippingOrderSummary[] = data?.data?.orders ?? data?.orders ?? [];
        setOrders(list);

        if (!options?.keepSelection) {
          setSelectedOrderId(list.length > 0 ? list[0].id : null);
        } else if (selectedOrderId) {
          const stillExists = list.some((order) => order.id === selectedOrderId);
          if (!stillExists) {
            setSelectedOrderId(list.length > 0 ? list[0].id : null);
          }
        }
      } catch (error) {
        
        showToast.error('Failed to load shipping orders');
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, selectedOrderId]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const token = getCookie('accessToken');
    if (!token) return;

    // Use Authorization header instead of query token for security
    // Note: EventSource doesn't support custom headers, so we use a workaround
    // For production, consider using a token endpoint that sets a short-lived cookie
    const streamUrl = new URL('/api/shiprocket/events/stream', BACKEND_BASE);
    // Query param fallback removed - using cookie-based auth only
    // Tokens should be in httpOnly cookies, which EventSource will send automatically

    const eventSource = new EventSource(streamUrl.toString(), {
      // EventSource doesn't support custom headers, so authentication must be via cookies
      // The backend will check httpOnly cookies automatically
      withCredentials: true
    } as any);

    eventSource.addEventListener('status', (event) => {
      try {
        const payload = JSON.parse(event.data);
        setOrders((prev) =>
          prev.map((order) =>
            order.id === payload.orderId
              ? {
                  ...order,
                  status: payload.status ?? order.status,
                  awbNumber: payload.awb ?? order.awbNumber,
                  trackingUrl: order.trackingUrl ?? payload.trackingUrl ?? order.trackingUrl,
                }
              : order
          )
        );
      } catch (error) {
        
      }
    });

    eventSource.addEventListener('label', (event) => {
      try {
        const payload = JSON.parse(event.data);
        setOrders((prev) =>
          prev.map((order) =>
            order.id === payload.orderId ? { ...order, labelUrl: payload.labelUrl } : order
          )
        );
      } catch (error) {
        
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const updateOrderState = (orderId: string, updater: (order: ShippingOrderSummary) => ShippingOrderSummary) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? updater(order) : order)));
  };

  const setActionBusy = (orderId: string, action: ActionKey, value: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [`${orderId}-${action}`]: value,
    }));
  };

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) {
        if (prev.includes(orderId)) {
          return prev;
        }
        return [...prev, orderId];
      }
      return prev.filter((id) => id !== orderId);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map((order) => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleCreateShipment = async (orderId: string) => {
    setActionBusy(orderId, 'create', true);
    try {
      const response = await fetch(`/api/admin/shiprocket/order/${orderId}/create`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to create shipment');
      }

      const updated = data?.data?.order ?? data?.order;
      if (updated) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...updated } : order)));
      }
      showToast.success('Shiprocket order created');
      await fetchOrders({ keepSelection: true });
    } catch (error) {
      
      showToast.error('Failed to create Shiprocket order');
    } finally {
      setActionBusy(orderId, 'create', false);
    }
  };

  const handleSchedulePickup = async (orderId: string) => {
    setActionBusy(orderId, 'pickup', true);
    try {
      const response = await fetch(`/api/admin/shiprocket/order/${orderId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to schedule pickup');
      }

      const updated = data?.data?.order ?? data?.order;
      if (updated) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...updated } : order)));
      }
      showToast.success('Pickup scheduled successfully');
      await fetchOrders({ keepSelection: true });
    } catch (error) {
      
      showToast.error('Failed to schedule pickup');
    } finally {
      setActionBusy(orderId, 'pickup', false);
    }
  };

  const handleGenerateLabel = async (orderId: string) => {
    setActionBusy(orderId, 'label', true);
    try {
      const response = await fetch(`/api/admin/shiprocket/order/${orderId}/label`);
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to generate label');
      }

      const labelUrl = data?.data?.labelUrl ?? data?.labelUrl;
      if (!labelUrl) {
        throw new Error('Label URL not returned from Shiprocket');
      }

      updateOrderState(orderId, (order) => ({ ...order, labelUrl }));
      showToast.success('Shipping label generated');
      return labelUrl as string;
    } catch (error) {
      
      showToast.error('Failed to generate label');
      return null;
    } finally {
      setActionBusy(orderId, 'label', false);
    }
  };

  const handleTrackShipment = async (orderId: string, awb?: string | null) => {
    if (!awb) {
      showToast.info('No AWB available for this order yet');
      return;
    }
    setActionBusy(orderId, 'track', true);
    try {
      const response = await fetch(`/api/admin/shiprocket/order/track/${awb}`);
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to fetch tracking details');
      }
      const payload = data?.data ?? data;
      setTrackingData((prev) => ({
        ...prev,
        [orderId]: {
          status: payload.status,
          events: payload.events ?? payload.trackingData ?? [],
          courierName: payload.courierName,
          trackingUrl: payload.trackingUrl,
        },
      }));
      showToast.success('Tracking details refreshed');
    } catch (error) {
      
      showToast.error('Failed to fetch tracking information');
    } finally {
      setActionBusy(orderId, 'track', false);
    }
  };

  const handleReturnShipment = async (orderId: string, reason: string) => {
    setReturnLoading(true);
    try {
      const response = await fetch(`/api/admin/shiprocket/order/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to create return order');
      }
      showToast.success('Return shipment created');
      setReturnTarget(null);
      await fetchOrders({ keepSelection: true });
    } catch (error) {
      
      showToast.error('Failed to create return shipment');
    } finally {
      setReturnLoading(false);
    }
  };

  const downloadLabelPdf = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shiprocket-label-${Date.now()}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const openLabelInNewTab = (url: string) => {
    if (typeof window === 'undefined') {
      return false;
    }
    const win = window.open(url, '_blank', 'noopener');
    if (!win) {
      showToast.error('Please allow pop-ups to view labels.');
      return false;
    }
    win.focus();
    return true;
  };

  const handleBatchPrint = async () => {
    if (selectedOrderIds.length === 0) return;
    setBatchPrinting(true);

    try {
      const printableLabels: Array<{ orderId: string; orderNumber: string; url: string }> = [];
      const failures: string[] = [];

      for (const orderId of selectedOrderIds) {
        const order = orders.find((item) => item.id === orderId);
        if (!order) continue;

        let labelUrl = order.labelUrl ?? null;

        if (!labelUrl) {
          try {
            const response = await fetch(`/api/admin/shiprocket/order/${orderId}/label`);
            const data = await response.json();
            if (!response.ok || !data?.success) {
              throw new Error(data?.error || 'Unable to generate label');
            }
            labelUrl = data?.data?.labelUrl ?? data?.labelUrl ?? null;
            if (!labelUrl) {
              throw new Error('Label URL not returned');
            }
            updateOrderState(orderId, (existing) => ({ ...existing, labelUrl }));
          } catch (error) {
            
            failures.push(order.orderNumber);
            continue;
          }
        }

        if (labelUrl) {
          printableLabels.push({
            orderId,
            orderNumber: order.orderNumber,
            url: labelUrl,
          });
        }
      }

      if (printableLabels.length === 0) {
        showToast.error('No labels available to print.');
        return;
      }

      if (typeof window === 'undefined') {
        showToast.error('Batch printing is only available in the browser.');
        return;
      }

      printableLabels.forEach((label, index) => {
        setTimeout(() => {
          openLabelInNewTab(label.url);
        }, index * 150);
      });

      showToast.success(
        `Opened ${printableLabels.length} label${printableLabels.length > 1 ? 's' : ''} in new tabs`
      );

      if (failures.length > 0) {
        showToast.error(
          `Label generation failed for: ${failures
            .slice(0, 3)
            .join(', ')}${failures.length > 3 ? '…' : ''}`
        );
      }
    } catch (error) {
      
      showToast.error('Batch print failed');
    } finally {
      setBatchPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Shiprocket Shipping</h1>
        <p className="text-sm text-gray-600">
          Create shipments, schedule pickups, generate labels, and monitor delivery statuses in real
          time.
        </p>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-1">
            <div className="relative w-full md:flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by order number, customer, AWB, or courier..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full md:w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {selectedOrderIds.length > 0 && (
              <span className="text-sm text-gray-500 sm:mr-2">
                {selectedOrderIds.length} selected
              </span>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => fetchOrders({ keepSelection: true })}
                className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Refresh
              </button>
              <button
                onClick={handleBatchPrint}
                disabled={selectedOrderIds.length === 0 || batchPrinting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <PrinterIcon className="h-4 w-4" />
                {batchPrinting ? 'Preparing…' : 'Batch Print'}
              </button>
              {selectedOrderIds.length > 0 && (
                <button
                  onClick={() => setSelectedOrderIds([])}
                  className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      onChange={(event) => handleSelectAll(event.target.checked)}
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Courier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    AWB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Loading shipping orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      No orders match your filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isSelected = order.id === selectedOrderId;
                    const isBulkSelected = selectedOrderIds.includes(order.id);
                    const rowIsActive = isSelected || isBulkSelected;
                    return (
                      <tr
                        key={order.id}
                        className={`cursor-pointer transition ${
                          rowIsActive ? 'bg-black/5' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            checked={isBulkSelected}
                            onChange={(event) =>
                              toggleOrderSelection(order.id, event.target.checked)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          {order.customerEmail && (
                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.courierName ?? <span className="text-gray-400">Pending</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.awbNumber ?? <span className="text-gray-400">Not generated</span>}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCreateShipment(order.id);
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              disabled={!!order.awbNumber || actionLoading[`${order.id}-create`]}
                            >
                              {actionLoading[`${order.id}-create`] ? 'Creating…' : 'Ship'}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleGenerateLabel(order.id);
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              disabled={!order.awbNumber || actionLoading[`${order.id}-label`]}
                            >
                              {actionLoading[`${order.id}-label`] ? 'Label…' : 'Label'}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleTrackShipment(order.id, order.awbNumber);
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              disabled={!order.awbNumber || actionLoading[`${order.id}-track`]}
                            >
                              {actionLoading[`${order.id}-track`] ? 'Tracking…' : 'Track'}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSchedulePickup(order.id);
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              disabled={!order.awbNumber || actionLoading[`${order.id}-pickup`]}
                            >
                              {actionLoading[`${order.id}-pickup`] ? 'Pickup…' : 'Pickup'}
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setReturnTarget(order.id);
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              disabled={
                                order.status !== 'delivered' ||
                                order.isReturned ||
                                actionLoading[`${order.id}-return`]
                              }
                            >
                              {actionLoading[`${order.id}-return`] ? 'Returning…' : 'Return'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {selectedOrder ? (
            <ShippingCard
              order={selectedOrder}
              onCreateShipment={() => handleCreateShipment(selectedOrder.id)}
              onSchedulePickup={() => handleSchedulePickup(selectedOrder.id)}
              onGenerateLabel={() => handleGenerateLabel(selectedOrder.id)}
              onTrackShipment={() => handleTrackShipment(selectedOrder.id, selectedOrder.awbNumber)}
              onReturnShipment={() => setReturnTarget(selectedOrder.id)}
              disabled={{
                create: !!selectedOrder.awbNumber || actionLoading[`${selectedOrder.id}-create`],
                pickup: !selectedOrder.awbNumber || actionLoading[`${selectedOrder.id}-pickup`],
                label: !selectedOrder.awbNumber || actionLoading[`${selectedOrder.id}-label`],
                track: !selectedOrder.awbNumber || actionLoading[`${selectedOrder.id}-track`],
                return:
                  selectedOrder.status !== 'delivered' ||
                  selectedOrder.isReturned ||
                  actionLoading[`${selectedOrder.id}-return`],
              }}
              extraContent={
                <>
                  {trackingData[selectedOrder.id] ? (
                    <TrackingStatus
                      currentStatus={
                        trackingData[selectedOrder.id].status ?? selectedOrder.status
                      }
                      events={trackingData[selectedOrder.id].events ?? []}
                    />
                  ) : null}
                  <InlineLabelPreview
                    labelUrl={selectedOrder.labelUrl}
                    isLoading={actionLoading[`${selectedOrder.id}-label`]}
                    onDownload={() => {
                      if (selectedOrder.labelUrl) {
                        downloadLabelPdf(selectedOrder.labelUrl);
                      }
                    }}
                    onPrint={() => {
                      if (selectedOrder.labelUrl) {
                        openLabelInNewTab(selectedOrder.labelUrl);
                      }
                    }}
                  />
                </>
              }
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
              Select an order to view shipment details.
            </div>
          )}
        </div>
      </div>
      <ReturnModal
        open={returnTarget !== null}
        loading={returnLoading}
        onClose={() => {
          if (returnLoading) return;
          setReturnTarget(null);
        }}
        onSubmit={(reason) => {
          const target = returnTarget;
          if (!target) return;
          setActionBusy(target, 'return', true);
          return handleReturnShipment(target, reason).finally(() => {
            setActionBusy(target, 'return', false);
          });
        }}
      />
    </div>
  );
}

interface InlineLabelPreviewProps {
  labelUrl?: string | null;
  isLoading?: boolean;
  onDownload: () => void;
  onPrint: () => void;
}

function InlineLabelPreview({
  labelUrl,
  isLoading,
  onDownload,
  onPrint,
}: InlineLabelPreviewProps) {
  const header = (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Label preview
      </h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={!labelUrl || isLoading}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={!labelUrl || isLoading}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Open Tab
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section className="space-y-3">
        {header}
        <div className="h-96 w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 animate-pulse" />
      </section>
    );
  }

  if (!labelUrl) {
    return (
      <section className="space-y-3">
        {header}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
          Label not generated yet. Use the <span className="font-medium">Generate Label</span>{' '}
          action to create one.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {header}
      <div className="h-96 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-inner">
        <iframe
          key={labelUrl}
          title="Shiprocket Label Preview"
          src={labelUrl}
          className="h-full w-full"
        />
      </div>
    </section>
  );
}

