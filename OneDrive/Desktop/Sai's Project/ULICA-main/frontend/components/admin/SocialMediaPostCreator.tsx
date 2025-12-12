'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon, DocumentTextIcon, CalendarIcon } from '@/components/ui/icons';
import { showToast } from '@/lib/toast';
import type { SocialMediaPost } from '@/types/social-media';

interface SocialMediaPostCreatorProps {
  post?: SocialMediaPost;
  onSave: (post: SocialMediaPost) => void;
  onCancel: () => void;
}

export function SocialMediaPostCreator({ post, onSave, onCancel }: SocialMediaPostCreatorProps) {
  const [formData, setFormData] = useState({
    content: post?.content || '',
    platforms: post?.platforms || (post?.platform ? [post.platform] : []),
    mediaUrls: post?.mediaUrls || [],
    scheduledAt: post?.scheduledAt || '',
    publishNow: !post?.scheduledAt
  });
  const [step, setStep] = useState(1);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/social-media/posts', {
        method: post ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: post?.id,
          publishNow: formData.publishNow
        })
      });

      const result = await response.json() as { success: boolean; post?: SocialMediaPost; message?: string };
      
      if (result.success && result.post) {
        onSave(result.post);
        showToast.success('Social post saved.');
      } else {
        showToast.error(result.message || 'Failed to save post.');
      }
    } catch (error) {
      
      showToast.error('An error occurred while saving the post.');
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
    
    // Convert files to URLs for preview
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, url]
      }));
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const steps = [
    { id: 1, name: 'Content', description: 'Write your post content' },
    { id: 2, name: 'Media', description: 'Add images and videos' },
    { id: 3, name: 'Platforms', description: 'Select social media platforms' },
    { id: 4, name: 'Schedule', description: 'Choose when to publish' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {post ? 'Edit Post' : 'Create Social Media Post'}
            </h2>
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
                  {stepItem.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= stepItem.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepItem.name}
                  </p>
                  <p className="text-xs text-gray-500">{stepItem.description}</p>
                </div>
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
            {/* Step 1: Content */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Post Content</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind?
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your post content here..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.content.length} characters
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Content Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Keep it engaging and relevant to your audience</li>
                    <li>• Use hashtags to increase reach</li>
                    <li>• Ask questions to encourage engagement</li>
                    <li>• Include a call-to-action when appropriate</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Media */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Add Media</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Media</p>
                    <p className="text-gray-500">Click to upload images or videos</p>
                  </label>
                </div>
                
                {formData.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.mediaUrls.map((url, index) => (
                      <div key={index} className="relative group w-full h-32">
                        <Image
                          src={url}
                          alt={`Media ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover rounded-lg"
                          unoptimized={url.startsWith('blob:') || url.startsWith('data:')}
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Platforms */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Select Platforms</h3>
                <p className="text-gray-600">Choose which social media platforms to publish to</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.platforms.includes(platform.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{platform.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formData.platforms.includes(platform.id) ? 'Selected' : 'Click to select'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {formData.platforms.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    Select at least one platform to continue
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Schedule Post</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="publish-now"
                      name="schedule"
                      checked={formData.publishNow}
                      onChange={() => setFormData(prev => ({ ...prev, publishNow: true, scheduledAt: '' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="publish-now" className="ml-3 text-sm font-medium text-gray-700">
                      Publish Now
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="schedule-later"
                      name="schedule"
                      checked={!formData.publishNow}
                      onChange={() => setFormData(prev => ({ ...prev, publishNow: false }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="schedule-later" className="ml-3 text-sm font-medium text-gray-700">
                      Schedule for Later
                    </label>
                  </div>
                  {!formData.publishNow && (
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Post Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Content:</strong> {formData.content.length} characters</p>
                    <p><strong>Media:</strong> {formData.mediaUrls.length} files</p>
                    <p><strong>Platforms:</strong> {formData.platforms.length} selected</p>
                    <p><strong>Schedule:</strong> {formData.publishNow ? 'Publish Now' : 'Scheduled'}</p>
                  </div>
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
                  disabled={step === 3 && formData.platforms.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {post ? 'Update Post' : 'Create Post'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
