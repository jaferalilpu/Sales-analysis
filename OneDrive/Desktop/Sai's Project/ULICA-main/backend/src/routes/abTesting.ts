import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { abTesting, ABTestVariant } from '../services/abTestingService';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { logger } from '../services/loggerService';
import { ExpressResponse } from '../types/express';

const router = express.Router();

// Validation schemas
const createTestSchema = [
  body('name').isString().trim().notEmpty(),
  body('description').isString().trim().notEmpty(),
  body('trafficAllocation').isInt({ min: 1, max: 100 }),
  body('variants').isArray({ min: 2 }),
  body('variants.*.name').isString().trim().notEmpty(),
  body('variants.*.description').isString().trim().notEmpty(),
  body('variants.*.trafficAllocation').isInt({ min: 0, max: 100 }),
  body('variants.*.configuration').isObject(),
  body('variants.*.isControl').isBoolean(),
  body('metrics').isArray({ min: 1 }),
  body('metrics.*.name').isString().trim().notEmpty(),
  body('metrics.*.description').isString().trim().notEmpty(),
  body('metrics.*.type').isIn(['conversion', 'revenue', 'engagement', 'custom']),
  body('metrics.*.isPrimary').isBoolean()
];

const updateTestSchema = [
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'running', 'paused', 'completed']),
  body('trafficAllocation').optional().isInt({ min: 1, max: 100 }),
  body('variants').optional().isArray({ min: 2 }),
  body('metrics').optional().isArray({ min: 1 })
];

const trackConversionSchema = [
  body('testId').isString().notEmpty(),
  body('metricName').isString().trim().notEmpty(),
  body('value').optional().isNumeric()
];

// Helper function to handle validation errors
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// Create A/B test (Admin only)
router.post('/tests', createTestSchema, handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const testData = req.body;
    
    // Validate traffic allocation
    const totalVariantAllocation = testData.variants.reduce((sum: number, variant: ABTestVariant) => sum + variant.trafficAllocation, 0);
    if (totalVariantAllocation !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Total variant traffic allocation must equal 100%'
      });
    }

    // Validate that exactly one variant is control
    const controlVariants = testData.variants.filter((variant: ABTestVariant) => variant.isControl);
    if (controlVariants.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Exactly one variant must be marked as control'
      });
    }

    const test = await abTesting.createTest({
      ...testData,
      status: 'draft',
      startDate: new Date()
    });

    if (test) {
      return res.status(201).json({
        success: true,
        message: 'A/B test created successfully',
        data: test
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to create A/B test'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error creating A/B test', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all A/B tests
router.get('/tests', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const { status } = req.query;
    const tests = await abTesting.getTests(status as string);

    res.json({
      success: true,
      data: tests
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error getting A/B tests:', { error: errorMsg }).catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific A/B test
router.get('/tests/:id', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const test = await abTesting.getTest(id);

    if (test) {
      return res.json({
        success: true,
        data: test
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error getting A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update A/B test (Admin only)
router.put('/tests/:id', [
  param('id').isString().notEmpty()
], updateTestSchema, handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const updates = req.body;

    const test = await abTesting.updateTest(id, updates);

    if (test) {
      return res.json({
        success: true,
        message: 'A/B test updated successfully',
        data: test
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error updating A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete A/B test (Admin only)
router.delete('/tests/:id', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const success = await abTesting.deleteTest(id);

    if (success) {
      return res.json({
        success: true,
        message: 'A/B test deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error deleting A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start A/B test (Admin only)
router.post('/tests/:id/start', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const success = await abTesting.startTest(id);

    if (success) {
      return res.json({
        success: true,
        message: 'A/B test started successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to start A/B test'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error starting A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Pause A/B test (Admin only)
router.post('/tests/:id/pause', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const success = await abTesting.pauseTest(id);

    if (success) {
      return res.json({
        success: true,
        message: 'A/B test paused successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to pause A/B test'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error pausing A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Complete A/B test (Admin only)
router.post('/tests/:id/complete', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const success = await abTesting.completeTest(id);

    if (success) {
      return res.json({
        success: true,
        message: 'A/B test completed successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to complete A/B test'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error completing A/B test:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get A/B test results (Admin only)
router.get('/tests/:id/results', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const results = await abTesting.getTestResults(id);

    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error getting A/B test results:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's variant for a test
router.get('/tests/:id/variant', [
  param('id').isString().notEmpty()
], handleValidationErrors, authenticateToken, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const assignment = await abTesting.getUserVariant(userId, id);

    if (assignment) {
      return res.json({
        success: true,
        data: assignment
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'User not assigned to this test'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error getting user variant:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Assign user to variant (Internal)
router.post('/tests/:id/assign', [
  param('id').isString().notEmpty()
], handleValidationErrors, async (req: AuthenticatedRequest | express.Request, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const userId = req.body.userId || ((req as AuthenticatedRequest).user?.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const assignment = await abTesting.assignUserToVariant(userId, id);

    if (assignment) {
      return res.status(201).json({
        success: true,
        message: 'User assigned to variant successfully',
        data: assignment
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to assign user to variant'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error assigning user to variant:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Track conversion
router.post('/conversions', trackConversionSchema, handleValidationErrors, authenticateToken, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const { testId, metricName, value = 1 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const success = await abTesting.trackConversion(userId, testId, metricName, value);

    if (success) {
      return res.json({
        success: true,
        message: 'Conversion tracked successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to track conversion'
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error tracking conversion:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's active tests
router.get('/user/tests', authenticateToken, async (req: AuthenticatedRequest, res: ExpressResponse) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get all running tests
    const runningTests = await abTesting.getTests('running');
    const userTests = [];

    for (const test of runningTests) {
      const assignment = await abTesting.getUserVariant(userId, test.id);
      if (assignment) {
        userTests.push({
          testId: test.id,
          testName: test.name,
          variantId: assignment.variantId,
          assignedAt: assignment.assignedAt
        });
      }
    }

    return res.json({
      success: true,
      data: userTests
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error getting user tests:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get test configuration for frontend
router.get('/tests/:id/config', [
  param('id').isString().notEmpty()
], handleValidationErrors, async (req: express.Request, res: ExpressResponse) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ success: false, message: 'Test ID is required' });
    }
    const test = await abTesting.getTest(id);

    if (!test || test.status !== 'running') {
      return res.status(404).json({
        success: false,
        message: 'Test not found or not running'
      });
    }

    // Return only the configuration needed for frontend
    const config = {
      testId: test.id,
      name: test.name,
      variants: test.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        configuration: variant.configuration
      }))
    };

    return res.json({
      success: true,
      data: config
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error getting test config:', { error: errorMsg }).catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
