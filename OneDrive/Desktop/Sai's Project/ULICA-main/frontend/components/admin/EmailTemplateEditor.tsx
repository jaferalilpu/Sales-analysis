'use client';

import { useState } from 'react';
import { XMarkIcon, EyeIcon, CheckIcon } from '@/components/ui/icons';
import type { EmailTemplate } from '@/types/email-marketing';

interface EmailTemplateEditorProps {
  template?: EmailTemplate | {
    id?: string;
    name: string;
    subject: string;
    content?: string;
    body?: string;
    type?: string;
    category?: string;
  };
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

export function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const templateContent = template && ('content' in template ? template.content : ('body' in template ? template.body : ''));
  const templateType = template && ('type' in template ? template.type : ('category' in template ? template.category : 'general'));
  
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: templateContent || '',
    category: templateType || 'general'
  });
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const templateData: EmailTemplate = {
      id: (template && 'id' in template ? template.id : '') || '',
      name: formData.name,
      subject: formData.subject,
      body: formData.content,
      type: formData.category
    };
    onSave(templateData);
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = formData.content.substring(0, start) + `{{${variable}}}` + formData.content.substring(end);
      handleContentChange(newContent);
    }
  };

  const variables = [
    'customer_name',
    'customer_email',
    'order_number',
    'order_total',
    'product_name',
    'company_name',
    'unsubscribe_link'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Email Template' : 'Create Email Template'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Template Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Template Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="welcome">Welcome</option>
                      <option value="order_confirmation">Order Confirmation</option>
                      <option value="shipping_update">Shipping Update</option>
                      <option value="promotional">Promotional</option>
                      <option value="newsletter">Newsletter</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Variables</h3>
                <div className="space-y-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      onClick={() => insertVariable(variable)}
                      className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click to insert variables into your template
                </p>
              </div>

              {/* Templates */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Templates</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">{{company_name}}</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">Hello {{customer_name}}!</h2>
        
        <p>Thank you for your interest in our products. We're excited to have you on board!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Browse our latest collection</li>
                <li>Get exclusive member discounts</li>
                <li>Stay updated with new arrivals</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Shop Now</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 {{company_name}}. All rights reserved.<br>
            <a href="{{unsubscribe_link}}" style="color: #6b7280;">Unsubscribe</a>
        </p>
    </div>
</body>
</html>`
                      }));
                    }}
                    className="w-full text-left px-3 py-2 text-xs bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                  >
                    Welcome Email Template
                  </button>
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">{{company_name}}</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">Order Confirmation</h2>
        
        <p>Hello {{customer_name}},</p>
        
        <p>Thank you for your order! We've received your order <strong>#{{order_number}}</strong> and it's being processed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Total:</strong> ₹{{order_total}}</p>
            <p style="margin: 5px 0;"><strong>Product:</strong> {{product_name}}</p>
        </div>
        
        <p>We'll send you another email when your order ships. If you have any questions, please contact our support team.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Order</a>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 {{company_name}}. All rights reserved.<br>
            <a href="{{unsubscribe_link}}" style="color: #6b7280;">Unsubscribe</a>
        </p>
    </div>
</body>
</html>`
                      }));
                    }}
                    className="w-full text-left px-3 py-2 text-xs bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                  >
                    Order Confirmation Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {previewMode ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Preview</h3>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                      className="prose max-w-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6">
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content (HTML)
                    </label>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter your HTML email content here..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
