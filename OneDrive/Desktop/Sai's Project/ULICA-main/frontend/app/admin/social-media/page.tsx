'use client';

import { useState } from 'react';
import SocialMediaDashboard from '@/components/admin/SocialMediaDashboard';
import { SocialMediaPostCreator } from '@/components/admin/SocialMediaPostCreator';
import { SocialMediaPost } from '@/types/social-media';

export default function SocialMediaPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);

  const handleCreatePost = () => {
    setEditingPost(null);
    setShowCreatePost(true);
  };

  const handleEditPost = (post: SocialMediaPost) => {
    setEditingPost(post);
    setShowCreatePost(true);
  };

  const handlePostSave = (post: SocialMediaPost) => {
    
    setShowCreatePost(false);
    setEditingPost(null);
    // Refresh the dashboard
    window.location.reload();
  };

  return (
    <>
      <SocialMediaDashboard />
      
      {showCreatePost && (
        <SocialMediaPostCreator
          post={editingPost || undefined}
          onSave={handlePostSave}
          onCancel={() => {
            setShowCreatePost(false);
            setEditingPost(null);
          }}
        />
      )}
    </>
  );
}