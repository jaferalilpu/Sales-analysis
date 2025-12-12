'use client';

import { useEffect, useState } from 'react';
import { showToast } from '@/lib/toast';
import { getErrorMessage } from '@/types/common';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MailIcon
} from '@/components/ui/icons';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: string;
  attempts: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  scheduledRetryAt?: string | null;
}

interface EmailLogResponse {
  success: boolean;
  data?: {
    logs: EmailLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'queued', label: 'Queued for retry' },
  { value: 'retrying', label: 'Retrying' },
  { value: 'failed', label: 'Failed' }
];

function statusBadge(status: string) {
  switch (status) {
    case 'sent':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircleIcon className="h-3 w-3" /> Sent
        </span>
      );
    case 'queued':
    case 'retrying':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <ClockIcon className="h-3 w-3" /> {status === 'queued' ? 'Queued' : 'Retrying'}
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
          <XCircleIcon className="h-3 w-3" /> Failed
        </span>
      );
    case 'sending':
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <ArrowPathIcon className="h-3 w-3 animate-spin" /> {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {status}
        </span>
      );
  }
}

export default function EmailHistoryPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchLogs = async (pageParam = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pageParam.toString());
      params.set('limit', '20');
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/email-logs?${params.toString()}`, {
        cache: 'no-store'
      });
      const data: EmailLogResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data?.message || 'Failed to load email logs');
      }

      setLogs(data.data.logs);
      setPage(data.data.pagination.page);
      setPages(data.data.pagination.pages);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast.error(errorMessage || 'Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleRetry = async (id: string) => {
    try {
      setRetryingId(id);
      const response = await fetch(`/api/admin/email-logs/${id}/retry`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Failed to queue retry');
      }
      showToast.success('Email queued for retry');
      fetchLogs(page);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast.error(errorMessage || 'Failed to queue retry');
    } finally {
      setRetryingId(null);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <MailIcon className="h-6 w-6 text-gray-500" />
              Email delivery history
            </h1>
            <p className="text-sm text-gray-500">
              Monitor transactional email attempts, status, and retry queue.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-black/10">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by recipient or subject…"
                className="px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="px-3 text-sm font-medium text-gray-600 hover:text-black"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Loading logs…
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No email logs found for the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{log.to}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{log.subject}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{statusBadge(log.status)}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {log.attempts}
                      {log.scheduledRetryAt && (
                        <p className="mt-1 text-xs text-gray-500">
                          Retry at {new Date(log.scheduledRetryAt).toLocaleString()}
                        </p>
                      )}
                      {log.lastError && (
                        <p className="mt-1 text-xs text-rose-500 truncate max-w-xs">{log.lastError}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {new Date(log.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id || log.status === 'sent'}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {retryingId === log.id ? (
                          <>
                            <ArrowPathIcon className="h-3 w-3 animate-spin" />
                            Queuing…
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="h-3 w-3" />
                            Retry
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= pages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

