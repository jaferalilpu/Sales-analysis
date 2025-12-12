'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { getErrorMessage } from '@/types/common';
import { Cog6ToothIcon, ArrowPathIcon } from '@/components/ui/icons';

interface IntegrationRecord {
  source: 'env' | 'database';
  values: Record<string, string | null>;
}

interface IntegrationResponse {
  success: boolean;
  data: IntegrationRecord;
  message?: string;
}

const PROVIDERS: Array<{
  key: 'email' | 'payments' | 'shiprocket';
  title: string;
  description: string;
  sensitive: string[];
}> = [
  {
    key: 'email',
    title: 'Email (SMTP)',
    description: 'Configure SMTP credentials for transactional and marketing emails.',
    sensitive: ['smtpPassword']
  },
  {
    key: 'payments',
    title: 'Payments',
    description: 'Manage Razorpay / PhonePe API keys used at checkout.',
    sensitive: ['razorpayKeySecret', 'phonepeSaltKey']
  },
  {
    key: 'shiprocket',
    title: 'Shiprocket',
    description: 'Shiprocket shipping integration used for order fulfillment.',
    sensitive: ['password']
  }
];

interface SettingsPayload {
  general: Record<string, unknown>;
  currency: Record<string, unknown>;
  email: Record<string, unknown>;
  security: Record<string, unknown>;
  notifications: Record<string, unknown>;
}

const EMAIL_RETRY_DEFAULTS = {
  retryEnabled: true,
  retryMaxAttempts: 3,
  retryDelayMinutes: 15,
};

export default function AdminSettingsPage() {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationRecord> | null>(null);
  const [forms, setForms] = useState<Record<string, Record<string, string>>>(
    {} as Record<string, Record<string, string>>
  );
  const [loading, setLoading] = useState(false);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [testProvider, setTestProvider] = useState<string | null>(null);

  const [settingsSnapshot, setSettingsSnapshot] = useState<SettingsPayload | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<{ 
    retryEnabled: boolean; 
    retryMaxAttempts: number; 
    retryDelayMinutes: number;
  }>({ ...EMAIL_RETRY_DEFAULTS });
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/settings/integrations');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data?.message || 'Unable to fetch integrations');
        }
        setIntegrations(data.data);
        const initialForms: Record<string, Record<string, string>> = {} as Record<
          string,
          Record<string, string>
        >;
        for (const provider of PROVIDERS) {
          const record = data.data[provider.key];
          initialForms[provider.key] = Object.fromEntries(
            Object.entries(record.values || {}).map(([key, value]) => [key, value ?? ''])
          ) as Record<string, string>;
        }
        setForms(initialForms);
      } catch (error: unknown) {
        
        showToast.error(getErrorMessage(error) || 'Failed to load integrations');
      } finally {
        setLoading(false);
      }
    };

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data?.message || 'Failed to fetch settings');
        }
        setSettingsSnapshot(data.data);
        const retryConfig = {
          retryEnabled: Boolean(
            data.data.email?.retryEnabled ?? EMAIL_RETRY_DEFAULTS.retryEnabled
          ),
          retryMaxAttempts: Number(
            data.data.email?.retryMaxAttempts ?? EMAIL_RETRY_DEFAULTS.retryMaxAttempts
          ),
          retryDelayMinutes: Number(
            data.data.email?.retryDelayMinutes ?? EMAIL_RETRY_DEFAULTS.retryDelayMinutes
          ),
        };
        setEmailDelivery(retryConfig);
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        showToast.error(errorMessage || 'Failed to load settings');
      }
    };

    loadIntegrations();
    loadSettings();
  }, []);

  const handleEmailDeliveryChange = (
    field: 'retryEnabled' | 'retryMaxAttempts' | 'retryDelayMinutes',
    value: string | boolean | number
  ) => {
    setEmailDelivery((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? value : value,
    }));
  };

  const handleEmailDeliverySave = async () => {
    if (!settingsSnapshot) return;

    try {
      setSavingEmailConfig(true);
      const payload: SettingsPayload = {
        ...settingsSnapshot,
        email: {
          ...settingsSnapshot.email,
          retryEnabled: emailDelivery.retryEnabled,
          retryMaxAttempts: emailDelivery.retryMaxAttempts,
          retryDelayMinutes: emailDelivery.retryDelayMinutes,
        },
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Failed to update email settings');
      }
      setSettingsSnapshot(data.data);
      showToast.success('Email delivery settings updated');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      showToast.error(errorMessage);
    } finally {
      setSavingEmailConfig(false);
    }
  };

  const handleChange = (provider: string, field: string, value: string) => {
    setForms((prev) => ({
      ...prev,
      [provider]: {
        ...(prev?.[provider] ?? {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async (provider: 'email' | 'payments' | 'shiprocket') => {
    try {
      setBusyProvider(provider);
      const payload = forms[provider];
      const response = await fetch(`/api/admin/settings/integrations/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: IntegrationResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Failed to save configuration');
      }
      setIntegrations((prev) => ({
        ...(prev ?? {}),
        [provider]: data.data,
      }));
      showToast.success('Integration settings saved');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error) || 'Failed to save integration';
      showToast.error(errorMessage);
    } finally {
      setBusyProvider(null);
    }
  };

  const handleTest = async (provider: 'email' | 'payments' | 'shiprocket') => {
    try {
      setTestProvider(provider);
      const response = await fetch(`/api/admin/settings/integrations/${provider}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forms[provider]),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Test failed');
      }
      showToast.success(data.message || 'Integration test passed');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error) || 'Integration test failed';
      showToast.error(errorMessage);
    } finally {
      setTestProvider(null);
    }
  };

  if (loading || !integrations) {
    return (
      <div className="p-10">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin" /> Loading integration settings…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Cog6ToothIcon className="h-6 w-6 text-gray-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
            <p className="text-sm text-gray-500">
              Manage credentials for ULICA integrations. Values provided via environment variables take
              precedence and are shown as read-only.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {PROVIDERS.map((provider) => {
            const record = integrations[provider.key];
            const form = forms[provider.key] ?? {};
            const envBacked = record?.source === 'env';
            return (
              <div
                key={provider.key}
                className="rounded-2xl border border-gray-200 bg-gray-50/70 p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{provider.title}</h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                    {envBacked && (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Credentials supplied via environment variables. Update your deployment secrets to
                        change these values.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleTest(provider.key)}
                      disabled={testProvider === provider.key}
                      className="rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {testProvider === provider.key ? 'Testing…' : 'Test integration'}
                    </button>
                    <button
                      onClick={() => {
                        if (envBacked) {
                          showToast.info('This integration is managed via environment variables.');
                          return;
                        }
                        handleSave(provider.key);
                      }}
                      disabled={envBacked || busyProvider === provider.key}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {envBacked
                        ? 'Managed via env'
                        : busyProvider === provider.key
                        ? 'Saving…'
                        : 'Save changes'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(form).map(([field, value]) => {
                    const isSensitive = provider.sensitive.includes(field);
                    const disabled = envBacked;
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {field}
                          {isSensitive && <span className="ml-1 text-red-500">•</span>}
                        </label>
                        <input
                          type={isSensitive ? 'password' : 'text'}
                          value={value ?? ''}
                          disabled={disabled}
                          onChange={(event) => handleChange(provider.key, field, event.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email delivery</h2>
            <p className="text-sm text-gray-500">
              Configure retry policies and review delivery logs for transactional emails. See{' '}
              <Link href="/admin/settings/email-history" className="text-gray-900 underline">
                email history
              </Link>{' '}
              for detailed logs.
            </p>
          </div>
          <button
            onClick={handleEmailDeliverySave}
            disabled={savingEmailConfig || !settingsSnapshot}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {savingEmailConfig ? 'Saving…' : 'Save delivery settings'}
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
              checked={emailDelivery.retryEnabled}
              onChange={(event) => handleEmailDeliveryChange('retryEnabled', event.target.checked)}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Enable automatic retry</p>
              <p className="text-xs text-gray-500">
                Failed emails will be re-queued automatically until they succeed or max attempts are reached.
              </p>
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Maximum attempts
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={emailDelivery.retryMaxAttempts}
              onChange={(event) =>
                handleEmailDeliveryChange('retryMaxAttempts', Number(event.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <p className="text-xs text-gray-500">Total attempts including the initial send.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Retry delay (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={240}
              value={emailDelivery.retryDelayMinutes}
              onChange={(event) =>
                handleEmailDeliveryChange('retryDelayMinutes', Number(event.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <p className="text-xs text-gray-500">Time before a failed email is attempted again.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
