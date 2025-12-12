'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  EnvelopeIcon, 
  UsersIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@/components/ui/icons';

import type { EmailTemplate } from '@/types/email-marketing';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  sentAt?: string;
}

interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  subscribedAt: string;
}

interface EmailMarketingDashboardProps {
  onCreateTemplate?: () => void;
  onEditTemplate?: (template: EmailTemplate) => void;
  onCreateCampaign?: () => void;
}

export default function EmailMarketingDashboard({
  onCreateTemplate,
  onEditTemplate,
  onCreateCampaign
}: EmailMarketingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'subscribers' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'campaigns') {
        const response = await fetch('/api/email/campaigns');
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else if (activeTab === 'templates') {
        const response = await fetch('/api/email/templates');
        const data = await response.json();
        setTemplates(data.templates || []);
      } else if (activeTab === 'subscribers') {
        const response = await fetch('/api/email/subscribers');
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCampaign = () => {
    if (onCreateCampaign) {
      onCreateCampaign();
    } else {
      setShowCreateCampaign(true);
    }
  };

  const handleCreateTemplate = () => {
    if (onCreateTemplate) {
      onCreateTemplate();
    } else {
      setShowCreateTemplate(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600">Manage campaigns, templates, and subscribers</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'campaigns' && (
            <button
              onClick={handleCreateCampaign}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Campaign
            </button>
          )}
          {activeTab === 'templates' && (
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Template
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'campaigns', name: 'Campaigns', icon: EnvelopeIcon },
            { id: 'templates', name: 'Templates', icon: PencilIcon },
            { id: 'subscribers', name: 'Subscribers', icon: UsersIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-500 mb-4">Create your first email campaign to get started</p>
                  <button
                    onClick={handleCreateCampaign}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-gray-600 mt-1">{campaign.subject}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>{campaign.recipientCount} recipients</span>
                            <span>•</span>
                            <span>{campaign.openRate}% open rate</span>
                            <span>•</span>
                            <span>{campaign.clickRate}% click rate</span>
                            <span>•</span>
                            <span>{formatDate(campaign.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                          <div className="flex space-x-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <PencilIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                  <p className="text-gray-500 mb-4">Create your first email template to get started</p>
                  <button
                    onClick={handleCreateTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Template
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{template.subject}</p>
                      <p className="text-gray-500 text-xs mb-4">{template.type || 'general'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{template.createdAt ? formatDate(template.createdAt) : 'N/A'}</span>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onEditTemplate?.(template)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Email Subscribers</h3>
                  <p className="text-gray-600 text-sm">Manage your email subscriber list</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscriber.firstName} {subscriber.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriber.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(subscriber.subscribedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UsersIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                      <p className="text-2xl font-semibold text-gray-900">{subscribers.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <EyeIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {campaigns.length > 0 
                          ? (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {campaigns.length > 0 
                          ? (campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create Email Campaign</h2>
            {/* Campaign creation form would go here */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateCampaign(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create Email Template</h2>
            {/* Template creation form would go here */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateTemplate(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}