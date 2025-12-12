/**
 * Social media-related types for frontend
 */

export interface SocialMediaPost {
  id: string;
  platform?: string;
  platforms?: string[];
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

