import { useState } from 'react';
import { XMarkIcon } from '@/components/ui/icons';

interface ReturnModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void | Promise<void>;
  loading?: boolean;
}

export function ReturnModal({ open, onClose, onSubmit, loading }: ReturnModalProps) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Initiate Return</h2>
              <p className="text-sm text-gray-500">
                Provide a reason to create a Shiprocket return order for this shipment.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="px-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Return reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                required
                placeholder="Describe why the return is being initiated..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </label>
            <p className="text-xs text-gray-500">
              This reason will be sent to Shiprocket and visible in shipment logs. Keep it concise.
            </p>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Processing...
                </>
              ) : (
                'Create Return'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

