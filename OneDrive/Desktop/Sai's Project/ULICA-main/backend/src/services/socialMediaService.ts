// @ts-nocheck
import axios from 'axios';
import { logger } from './loggerService';

export interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';
  content: string;
  mediaUrls?: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

export interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface SocialMediaAnalytics {
  platform: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  posts: {
    total: number;
    published: number;
    scheduled: number;
    draft: number;
  };
}

class SocialMediaService {
  private facebookAppId: string;
  private facebookAppSecret: string;
  private instagramAppId: string;
  private instagramAppSecret: string;
  private twitterApiKey: string;
  private twitterApiSecret: string;
  private linkedinClientId: string;
  private linkedinClientSecret: string;
  private tiktokAppId: string;
  private tiktokAppSecret: string;
  private youtubeApiKey: string;

  constructor() {
    this.facebookAppId = process.env.FACEBOOK_APP_ID || '';
    this.facebookAppSecret = process.env.FACEBOOK_APP_SECRET || '';
    this.instagramAppId = process.env.INSTAGRAM_APP_ID || '';
    this.instagramAppSecret = process.env.INSTAGRAM_APP_SECRET || '';
    this.twitterApiKey = process.env.TWITTER_API_KEY || '';
    this.twitterApiSecret = process.env.TWITTER_API_SECRET || '';
    this.linkedinClientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.tiktokAppId = process.env.TIKTOK_APP_ID || '';
    this.tiktokAppSecret = process.env.TIKTOK_APP_SECRET || '';
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
  }

  // Facebook integration
  async connectFacebookAccount(accessToken: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/me`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,picture'
          }
        }
      );

      return {
        id: response.data.id,
        platform: 'facebook',
        username: response.data.name,
        displayName: response.data.name,
        profilePicture: response.data.picture?.data?.url,
        isConnected: true,
        accessToken
      };
    } catch (error) {
      await logger.error('Error connecting Facebook account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToFacebook(accountId: string, content: string, mediaUrls?: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('facebook', accountId);
      if (!accessToken) return false;

      const postData: any = {
        message: content,
        access_token: accessToken
      };

      if (mediaUrls && mediaUrls.length > 0) {
        // Upload media first
        const mediaIds = await this.uploadMediaToFacebook(accessToken, mediaUrls);
        if (mediaIds.length > 0) {
          postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
        }
      }

      await axios.post(
        `https://graph.facebook.com/v18.0/${accountId}/feed`,
        postData
      );

      return true;
    } catch (error) {
      await logger.error('Error posting to Facebook', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  private async uploadMediaToFacebook(accessToken: string, mediaUrls: string[]): Promise<string[]> {
    const mediaIds: string[] = [];
    
    for (const url of mediaUrls) {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/v18.0/me/photos`,
          {
            url,
            access_token: accessToken
          }
        );
        mediaIds.push(response.data.id);
      } catch (error) {
        await logger.error('Error uploading media to Facebook', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return mediaIds;
  }

  // Instagram integration
  async connectInstagramAccount(accessToken: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/me/accounts`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,instagram_business_account'
          }
        }
      );

      const instagramAccount = response.data.data.find((account: any) => account.instagram_business_account);
      if (!instagramAccount) return null;

      const instagramResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${instagramAccount.instagram_business_account.id}`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,username,name,profile_picture_url'
          }
        }
      );

      return {
        id: instagramResponse.data.id,
        platform: 'instagram',
        username: instagramResponse.data.username,
        displayName: instagramResponse.data.name,
        profilePicture: instagramResponse.data.profile_picture_url,
        isConnected: true,
        accessToken
      };
    } catch (error) {
      await logger.error('Error connecting Instagram account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToInstagram(accountId: string, content: string, mediaUrls: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('instagram', accountId);
      if (!accessToken || !mediaUrls.length) return false;

      // Create media container
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${accountId}/media`,
        {
          image_url: mediaUrls[0],
          caption: content,
          access_token: accessToken
        }
      );

      const containerId = mediaResponse.data.id;

      // Publish the media
      await axios.post(
        `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken
        }
      );

      return true;
    } catch (error) {
      await logger.error('Error posting to Instagram', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Twitter integration
  async connectTwitterAccount(accessToken: string, accessTokenSecret: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://api.twitter.com/2/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        id: response.data.data.id,
        platform: 'twitter',
        username: response.data.data.username,
        displayName: response.data.data.name,
        isConnected: true,
        accessToken,
        refreshToken: accessTokenSecret
      };
    } catch (error) {
      await logger.error('Error connecting Twitter account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToTwitter(accountId: string, content: string, mediaUrls?: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('twitter', accountId);
      if (!accessToken) return false;

      const postData: any = {
        text: content
      };

      if (mediaUrls && mediaUrls.length > 0) {
        // Upload media first
        const mediaIds = await this.uploadMediaToTwitter(accessToken, mediaUrls);
        if (mediaIds.length > 0) {
          postData.media = {
            media_ids: mediaIds
          };
        }
      }

      await axios.post(
        `https://api.twitter.com/2/tweets`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      await logger.error('Error posting to Twitter', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  private async uploadMediaToTwitter(accessToken: string, mediaUrls: string[]): Promise<string[]> {
    const mediaIds: string[] = [];
    
    for (const url of mediaUrls) {
      try {
        // Download the media file
        const mediaResponse = await axios.get(url, { responseType: 'arraybuffer' });
        const mediaBuffer = Buffer.from(mediaResponse.data);
        
        // Upload to Twitter
        const uploadResponse = await axios.post(
          `https://upload.twitter.com/1.1/media/upload.json`,
          {
            media_data: mediaBuffer.toString('base64')
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        mediaIds.push(uploadResponse.data.media_id_string);
      } catch (error) {
        await logger.error('Error uploading media to Twitter', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return mediaIds;
  }

  // LinkedIn integration
  async connectLinkedInAccount(accessToken: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/v2/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        id: response.data.id,
        platform: 'linkedin',
        username: response.data.localizedFirstName + ' ' + response.data.localizedLastName,
        displayName: response.data.localizedFirstName + ' ' + response.data.localizedLastName,
        isConnected: true,
        accessToken
      };
    } catch (error) {
      await logger.error('Error connecting LinkedIn account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToLinkedIn(accountId: string, content: string, mediaUrls?: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('linkedin', accountId);
      if (!accessToken) return false;

      const postData: any = {
        author: `urn:li:person:${accountId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        }
      };

      if (mediaUrls && mediaUrls.length > 0) {
        // Upload media first
        const mediaUrns = await this.uploadMediaToLinkedIn(accessToken, mediaUrls);
        if (mediaUrns.length > 0) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaUrns.map(urn => ({
            status: 'READY',
            description: {
              text: content
            },
            media: urn
          }));
        }
      }

      await axios.post(
        `https://api.linkedin.com/v2/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      await logger.error('Error posting to LinkedIn', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  private async uploadMediaToLinkedIn(accessToken: string, mediaUrls: string[]): Promise<string[]> {
    const mediaUrns: string[] = [];
    
    for (const url of mediaUrls) {
      try {
        // Register upload
        const registerResponse = await axios.post(
          `https://api.linkedin.com/v2/assets?action=registerUpload`,
          {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: 'urn:li:person:me',
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerResponse.data.value.asset;

        // Download and upload the media
        const mediaResponse = await axios.get(url, { responseType: 'arraybuffer' });
        await axios.put(uploadUrl, mediaResponse.data, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        mediaUrns.push(asset);
      } catch (error) {
        await logger.error('Error uploading media to LinkedIn', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return mediaUrns;
  }

  // TikTok integration
  async connectTikTokAccount(accessToken: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://open-api.tiktok.com/user/info/`,
        {
          params: {
            access_token: accessToken,
            fields: 'open_id,union_id,avatar_url,display_name'
          }
        }
      );

      return {
        id: response.data.data.user.open_id,
        platform: 'tiktok',
        username: response.data.data.user.display_name,
        displayName: response.data.data.user.display_name,
        profilePicture: response.data.data.user.avatar_url,
        isConnected: true,
        accessToken
      };
    } catch (error) {
      await logger.error('Error connecting TikTok account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToTikTok(accountId: string, content: string, mediaUrls: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('tiktok', accountId);
      if (!accessToken || !mediaUrls.length) return false;

      // TikTok requires video upload, not just URL
      // This is a simplified version - actual implementation would require file upload
      const response = await axios.post(
        `https://open-api.tiktok.com/share/video/upload/`,
        {
          video_url: mediaUrls[0],
          text: content,
          access_token: accessToken
        }
      );

      return response.data.error_code === 0;
    } catch (error) {
      await logger.error('Error posting to TikTok', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // YouTube integration
  async connectYouTubeAccount(accessToken: string): Promise<SocialMediaAccount | null> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const channel = response.data.items[0];
      return {
        id: channel.id,
        platform: 'youtube',
        username: channel.snippet.title,
        displayName: channel.snippet.title,
        profilePicture: channel.snippet.thumbnails.default.url,
        isConnected: true,
        accessToken
      };
    } catch (error) {
      await logger.error('Error connecting YouTube account', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async postToYouTube(accountId: string, content: string, mediaUrls: string[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken('youtube', accountId);
      if (!accessToken || !mediaUrls.length) return false;

      // YouTube requires video upload, not just URL
      // This is a simplified version - actual implementation would require file upload
      const response = await axios.post(
        `https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status`,
        {
          snippet: {
            title: content,
            description: content,
            tags: ['ulica', 'streetwear', 'fashion']
          },
          status: {
            privacyStatus: 'public'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      await logger.error('Error posting to YouTube', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Cross-platform posting
  async postToAllPlatforms(accounts: SocialMediaAccount[], content: string, mediaUrls?: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const account of accounts) {
      try {
        let success = false;
        
        switch (account.platform) {
          case 'facebook':
            success = await this.postToFacebook(account.id, content, mediaUrls);
            break;
          case 'instagram':
            success = await this.postToInstagram(account.id, content, mediaUrls || []);
            break;
          case 'twitter':
            success = await this.postToTwitter(account.id, content, mediaUrls);
            break;
          case 'linkedin':
            success = await this.postToLinkedIn(account.id, content, mediaUrls);
            break;
          case 'tiktok':
            success = await this.postToTikTok(account.id, content, mediaUrls || []);
            break;
          case 'youtube':
            success = await this.postToYouTube(account.id, content, mediaUrls || []);
            break;
        }
        
        results[account.platform] = success;
      } catch (error) {
        await logger.error(`Error posting to ${account.platform}`, { error: error instanceof Error ? error.message : String(error) });
        results[account.platform] = false;
      }
    }

    return results;
  }

  // Analytics
  async getAnalytics(platform: string, accountId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<SocialMediaAnalytics | null> {
    try {
      const accessToken = await this.getAccessToken(platform, accountId);
      if (!accessToken) return null;

      // This is a simplified version - actual implementation would fetch real analytics
      return {
        platform,
        period,
        metrics: {
          followers: 0,
          engagement: 0,
          reach: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        },
        posts: {
          total: 0,
          published: 0,
          scheduled: 0,
          draft: 0
        }
      };
    } catch (error) {
      await logger.error('Error getting analytics', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Helper method to get access token (would be stored in database)
  private async getAccessToken(platform: string, accountId: string): Promise<string | null> {
    // In a real implementation, this would fetch from database
    // For now, return null to indicate no token available
    return null;
  }
}

export const socialMedia = new SocialMediaService();
