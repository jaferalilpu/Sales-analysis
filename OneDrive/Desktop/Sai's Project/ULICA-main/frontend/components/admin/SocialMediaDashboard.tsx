'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  ShareIcon, 
  CalendarIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@/components/ui/icons';

interface SocialMediaPost {
  id: string;
  content: string;
  platforms: string[];
  mediaUrls: string[];
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
  createdAt: string;
  publishedAt?: string;
}

interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  followers: number;
  lastSync: string;
}

export default function SocialMediaDashboard() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'accounts' | 'analytics'>('posts');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'posts') {
        const response = await fetch('/api/admin/social-media/posts');
        const data = await response.json();
        setPosts(data.posts || []);
      } else if (activeTab === 'accounts') {
        const response = await fetch('/api/admin/social-media/accounts');
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleEditPost = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowCreatePost(true);
  };

  const handlePublishPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/social-media/posts/${postId}/publish`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/social-media/posts/${postId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircleIcon className="w-4 h-4" />;
      case 'scheduled': return <CalendarIcon className="w-4 h-4" />;
      case 'failed': return <XCircleIcon className="w-4 h-4" />;
      default: return <PauseIcon className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'youtube': return '📺';
      default: return '📱';
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
          <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
          <p className="text-gray-600">Manage your social media presence and content</p>
        </div>
        <button
          onClick={handleCreatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Post
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'posts', name: 'Posts', icon: ShareIcon },
            { id: 'accounts', name: 'Accounts', icon: PhotoIcon },
            { id: 'analytics', name: 'Analytics', icon: EyeIcon }
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
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <ShareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Create your first social media post to get started</p>
                  <button
                    onClick={handleCreatePost}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Post #{post.id.slice(-6)}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(post.status)}`}>
                              {getStatusIcon(post.status)}
                              <span className="ml-1">{post.status.toUpperCase()}</span>
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {post.platforms.map((platform) => (
                                <span key={platform} className="text-lg">
                                  {getPlatformIcon(platform)}
                                </span>
                              ))}
                            </div>
                            <span>•</span>
                            <span>{post.mediaUrls.length} media files</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                            {post.scheduledAt && (
                              <>
                                <span>•</span>
                                <span>Scheduled: {formatDate(post.scheduledAt)}</span>
                              </>
                            )}
                          </div>
                          {post.status === 'published' && post.engagement && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-4 text-sm text-gray-600">
                                  <span>❤️ {post.engagement.likes} likes</span>
                                  <span>💬 {post.engagement.comments} comments</span>
                                  <span>🔄 {post.engagement.shares} shares</span>
                                  <span>👆 {post.engagement.clicks} clicks</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Edit Post"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {post.status === 'draft' && (
                            <button
                              onClick={() => handlePublishPost(post.id)}
                              className="p-1 text-green-400 hover:text-green-600"
                              title="Publish Now"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Delete Post"
                          >
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

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getPlatformIcon(account.platform)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{account.platform}</h4>
                            <p className="text-sm text-gray-600">@{account.username}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{account.followers.toLocaleString()} followers</p>
                        <p>Last sync: {formatDate(account.lastSync)}</p>
                      </div>
                      <div className="mt-3">
                        {account.isConnected ? (
                          <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                            Disconnect
                          </button>
                        ) : (
                          <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                      <ShareIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-semibold text-gray-900">{posts.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {posts.filter(p => p.status === 'published').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Scheduled</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {posts.filter(p => p.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <EyeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {posts.reduce((sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedPost ? 'Edit Post' : 'Create Social Media Post'}
              </h2>
              <button
                onClick={() => {
                  setShowCreatePost(false);
                  setSelectedPost(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Post creation form would go here */}
              <p className="text-gray-500">Social media post creation form will be implemented here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}