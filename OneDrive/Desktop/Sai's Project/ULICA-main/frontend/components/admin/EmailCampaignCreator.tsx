'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UsersIcon, CalendarIcon, ClockIcon } from '@/components/ui/icons';
import { showToast } from '@/lib/toast';
import type { EmailCampaign } from '@/types/email-marketing';

interface EmailCampaignCreatorProps {
  onSave: (campaign: EmailCampaign) => void;
  onCancel: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export function EmailCampaignCreator({ onSave, onCancel }: EmailCampaignCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    templateId: '',
    scheduledAt: '',
    recipientType: 'all', // 'all', 'segment', 'custom'
    customEmails: '',
    segment: 'all_subscribers'
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      content: template.content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        ...formData,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        customEmails: formData.customEmails ? formData.customEmails.split(',').map(email => email.trim()) : []
      };

      const response = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      const result = await response.json() as { success: boolean; campaign?: EmailCampaign; message?: string };
      
      if (result.success && result.campaign) {
        onSave(result.campaign);
        showToast.success('Email campaign created.');
      } else {
        showToast.error(result.message || 'Failed to create campaign.');
      }
    } catch (error) {
      
      showToast.error('An error occurred while creating the campaign.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Campaign Details', icon: UsersIcon },
    { id: 2, name: 'Template Selection', icon: CalendarIcon },
    { id: 3, name: 'Recipients', icon: UsersIcon },
    { id: 4, name: 'Schedule', icon: ClockIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Create Email Campaign</h2>
            <p className="text-gray-600 text-sm">Step {step} of 4</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepItem.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <stepItem.icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepItem.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepItem.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepItem.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email subject"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email content (HTML supported)"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Template Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Choose Template (Optional)</h3>
                <p className="text-gray-600 text-sm">
                  You can use a pre-built template or create your own content above.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.templateId === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      <p className="text-xs text-gray-500 mt-2">{template.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Recipients */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Select Recipients</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all"
                      name="recipientType"
                      value="all"
                      checked={formData.recipientType === 'all'}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="all" className="ml-3 text-sm font-medium text-gray-700">
                      All Subscribers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="segment"
                      name="recipientType"
                      value="segment"
                      checked={formData.recipientType === 'segment'}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="segment" className="ml-3 text-sm font-medium text-gray-700">
                      Specific Segment
                    </label>
                  </div>
                  {formData.recipientType === 'segment' && (
                    <div className="ml-7">
                      <select
                        value={formData.segment}
                        onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all_subscribers">All Subscribers</option>
                        <option value="active_customers">Active Customers</option>
                        <option value="new_subscribers">New Subscribers</option>
                        <option value="inactive_customers">Inactive Customers</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="custom"
                      name="recipientType"
                      value="custom"
                      checked={formData.recipientType === 'custom'}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="custom" className="ml-3 text-sm font-medium text-gray-700">
                      Custom Email List
                    </label>
                  </div>
                  {formData.recipientType === 'custom' && (
                    <div className="ml-7">
                      <textarea
                        value={formData.customEmails}
                        onChange={(e) => setFormData(prev => ({ ...prev, customEmails: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email addresses separated by commas"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter email addresses separated by commas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Schedule Campaign</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="now"
                      name="schedule"
                      value="now"
                      checked={!formData.scheduledAt}
                      onChange={() => setFormData(prev => ({ ...prev, scheduledAt: '' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="now" className="ml-3 text-sm font-medium text-gray-700">
                      Send Now
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="scheduled"
                      name="schedule"
                      value="scheduled"
                      checked={!!formData.scheduledAt}
                      onChange={() => setFormData(prev => ({ ...prev, scheduledAt: new Date().toISOString().slice(0, 16) }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="scheduled" className="ml-3 text-sm font-medium text-gray-700">
                      Schedule for Later
                    </label>
                  </div>
                  {formData.scheduledAt && (
                    <div className="ml-7">
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between p-6 border-t">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            <div className="flex space-x-3">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
