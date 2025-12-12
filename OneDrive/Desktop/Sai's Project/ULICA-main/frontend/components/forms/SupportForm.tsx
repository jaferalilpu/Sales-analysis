'use client';

import { useState } from 'react';

interface SupportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticketData: any) => void;
}

export function SupportForm({ isOpen, onClose, onCreateTicket }: SupportFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<typeof formData> = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreateTicket(formData);
    setFormData({ subject: '', description: '', priority: 'medium', category: 'general' });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({ subject: '', description: '', priority: 'medium', category: 'general' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-8 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 text-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Raise Support Ticket
              </h2>
              <p className="text-gray-500 text-sm" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Describe your issue and we'll get back to you soon
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="product">Product Question</option>
                  <option value="return">Return & Refund</option>
                  <option value="payment">Payment Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of your issue"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none bg-white shadow-sm ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please provide detailed information about your issue..."
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {errors.description}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end space-x-4 p-8 pt-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
