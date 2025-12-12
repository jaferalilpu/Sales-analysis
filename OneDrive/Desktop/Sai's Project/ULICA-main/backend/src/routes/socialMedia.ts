// @ts-nocheck
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { socialMedia, SocialMediaAccount, SocialMediaPost } from '../services/socialMediaService';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { logger } from '../services/loggerService';

const router = express.Router();

// Validation schemas
const connectAccountSchema = [
  body('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']),
  body('accessToken').isString().notEmpty(),
  body('accessTokenSecret').optional().isString()
];

const postSchema = [
  body('content').isString().trim().notEmpty(),
  body('mediaUrls').optional().isArray(),
  body('platforms').optional().isArray()
];

const analyticsSchema = [
  param('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']),
  query('period').optional().isIn(['day', 'week', 'month', 'year'])
];

// Helper function to handle validation errors
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Connect social media account
router.post('/connect', connectAccountSchema, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const { platform, accessToken, accessTokenSecret } = req.body;
    let account: SocialMediaAccount | null = null;

    switch (platform) {
      case 'facebook':
        account = await socialMedia.connectFacebookAccount(accessToken);
        break;
      case 'instagram':
        account = await socialMedia.connectInstagramAccount(accessToken);
        break;
      case 'twitter':
        if (!accessTokenSecret) {
          return res.status(400).json({
            success: false,
            message: 'Access token secret required for Twitter'
          });
        }
        account = await socialMedia.connectTwitterAccount(accessToken, accessTokenSecret);
        break;
      case 'linkedin':
        account = await socialMedia.connectLinkedInAccount(accessToken);
        break;
      case 'tiktok':
        account = await socialMedia.connectTikTokAccount(accessToken);
        break;
      case 'youtube':
        account = await socialMedia.connectYouTubeAccount(accessToken);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported platform'
        });
    }

    if (account) {
      res.status(201).json({
        success: true,
        message: `${platform} account connected successfully`,
        data: account
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to connect account'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error connecting social media account', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Post to social media
router.post('/post', postSchema, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const { content, mediaUrls, platforms } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's connected accounts (in a real app, this would come from database)
    const connectedAccounts: SocialMediaAccount[] = []; // This would be fetched from database

    if (connectedAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No social media accounts connected'
      });
    }

    // Filter accounts by requested platforms if specified
    const accountsToPost = platforms 
      ? connectedAccounts.filter(account => platforms.includes(account.platform))
      : connectedAccounts;

    const results = await socialMedia.postToAllPlatforms(accountsToPost, content, mediaUrls);

    res.json({
      success: true,
      message: 'Post published successfully',
      data: {
        results,
        totalPlatforms: accountsToPost.length,
        successfulPosts: Object.values(results).filter(Boolean).length
      }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error posting to social media', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Post to specific platform
router.post('/post/:platform', [
  param('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']),
  body('content').isString().trim().notEmpty(),
  body('mediaUrls').optional().isArray()
], handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { content, mediaUrls } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's connected account for this platform (in a real app, this would come from database)
    const connectedAccount: SocialMediaAccount | null = null; // This would be fetched from database

    if (!connectedAccount) {
      return res.status(400).json({
        success: false,
        message: `${platform} account not connected`
      });
    }

    let success = false;
    
    switch (platform) {
      case 'facebook':
        success = await socialMedia.postToFacebook(connectedAccount.id, content, mediaUrls);
        break;
      case 'instagram':
        success = await socialMedia.postToInstagram(connectedAccount.id, content, mediaUrls || []);
        break;
      case 'twitter':
        success = await socialMedia.postToTwitter(connectedAccount.id, content, mediaUrls);
        break;
      case 'linkedin':
        success = await socialMedia.postToLinkedIn(connectedAccount.id, content, mediaUrls);
        break;
      case 'tiktok':
        success = await socialMedia.postToTikTok(connectedAccount.id, content, mediaUrls || []);
        break;
      case 'youtube':
        success = await socialMedia.postToYouTube(connectedAccount.id, content, mediaUrls || []);
        break;
    }

    if (success) {
      res.json({
        success: true,
        message: `Post published to ${platform} successfully`
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Failed to publish to ${platform}`
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error posting to ${req.params.platform}`, { platform: req.params.platform, error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get connected accounts
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's connected accounts (in a real app, this would come from database)
    const connectedAccounts: SocialMediaAccount[] = []; // This would be fetched from database

    res.json({
      success: true,
      data: connectedAccounts
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error getting connected accounts', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Disconnect account
router.delete('/accounts/:platform', [
  param('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
], handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Remove account from database (in a real app, this would update the database)
    // For now, just return success

    res.json({
      success: true,
      message: `${platform} account disconnected successfully`
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error disconnecting account:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get analytics
router.get('/analytics/:platform', analyticsSchema, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { period = 'month' } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's connected account for this platform (in a real app, this would come from database)
    const connectedAccount: SocialMediaAccount | null = null; // This would be fetched from database

    if (!connectedAccount) {
      return res.status(400).json({
        success: false,
        message: `${platform} account not connected`
      });
    }

    const analytics = await socialMedia.getAnalytics(platform, connectedAccount.id, period as any);

    if (analytics) {
      res.json({
        success: true,
        data: analytics
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error getting analytics:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Schedule post (Admin only)
router.post('/schedule', [
  body('content').isString().trim().notEmpty(),
  body('mediaUrls').optional().isArray(),
  body('platforms').isArray(),
  body('scheduledAt').isISO8601().toDate()
], handleValidationErrors, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;

    // In a real implementation, this would save the scheduled post to database
    // and use a job queue (like Bull or Agenda) to publish at the scheduled time

    res.status(201).json({
      success: true,
      message: 'Post scheduled successfully',
      data: {
        scheduledAt,
        platforms,
        content: content.substring(0, 100) + '...'
      }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error scheduling post:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get scheduled posts (Admin only)
router.get('/scheduled', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real implementation, this would fetch scheduled posts from database
    const scheduledPosts: SocialMediaPost[] = [];

    res.json({
      success: true,
      data: scheduledPosts
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error getting scheduled posts:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel scheduled post (Admin only)
router.delete('/scheduled/:id', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, this would cancel the scheduled post in database
    // and remove it from the job queue

    res.json({
      success: true,
      message: 'Scheduled post cancelled successfully'
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error cancelling scheduled post:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get OAuth URLs for platform connection
router.get('/oauth/:platform', [
  param('platform').isIn(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'])
], (req, res) => {
  try {
    const { platform } = req.params;
    const baseUrl = process.env.FRONTEND_URL || 'https://ulica-6x1x-git-main-charansai0108s-projects.vercel.app';
    const redirectUri = `${baseUrl}/admin/social-media/callback`;

    let oauthUrl = '';

    switch (platform) {
      case 'facebook':
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement`;
        break;
      case 'instagram':
        oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish`;
        break;
      case 'twitter':
        oauthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read`;
        break;
      case 'linkedin':
        oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=w_member_social`;
        break;
      case 'tiktok':
        oauthUrl = `https://www.tiktok.com/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.publish&response_type=code&redirect_uri=${redirectUri}`;
        break;
      case 'youtube':
        oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=https://www.googleapis.com/auth/youtube.upload&response_type=code&access_type=offline`;
        break;
    }

    res.json({
      success: true,
      data: {
        oauthUrl,
        platform
      }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error generating OAuth URL:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
