// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { logger } from './loggerService';

const prisma = new PrismaClient();

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  trafficAllocation: number; // Percentage of traffic to include in test
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // Percentage of traffic for this variant
  configuration: Record<string, any>; // Variant-specific configuration
  isControl: boolean;
  isActive: boolean;
}

export interface ABTestMetric {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  targetValue?: number;
  isPrimary: boolean;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  isControl: boolean;
  participants: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  confidence: number;
  statisticalSignificance: boolean;
  metrics: Record<string, number>;
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  isActive: boolean;
}

class ABTestingService {
  // Create a new A/B test
  async createTest(testData: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest | null> {
    try {
      const test = await prisma.aBTest.create({
        data: {
          name: testData.name,
          description: testData.description,
          status: testData.status,
          startDate: testData.startDate,
          endDate: testData.endDate,
          trafficAllocation: testData.trafficAllocation,
          variants: JSON.stringify(testData.variants),
          metrics: JSON.stringify(testData.metrics),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status as any,
        startDate: test.startDate,
        endDate: test.endDate,
        trafficAllocation: test.trafficAllocation,
        variants: JSON.parse(test.variants),
        metrics: JSON.parse(test.metrics),
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      };
    } catch (error) {
      await logger.error('Error creating A/B test', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Get all A/B tests
  async getTests(status?: string): Promise<ABTest[]> {
    try {
      const whereClause = status ? { status } : {};
      const tests = await prisma.aBTest.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      return tests.map(test => ({
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status as any,
        startDate: test.startDate,
        endDate: test.endDate,
        trafficAllocation: test.trafficAllocation,
        variants: JSON.parse(test.variants),
        metrics: JSON.parse(test.metrics),
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      }));
    } catch (error) {
      await logger.error('Error getting A/B tests', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // Get a specific A/B test
  async getTest(testId: string): Promise<ABTest | null> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId }
      });

      if (!test) return null;

      return {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status as any,
        startDate: test.startDate,
        endDate: test.endDate,
        trafficAllocation: test.trafficAllocation,
        variants: JSON.parse(test.variants),
        metrics: JSON.parse(test.metrics),
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      };
    } catch (error) {
      await logger.error('Error getting A/B test', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Update A/B test
  async updateTest(testId: string, updates: Partial<ABTest>): Promise<ABTest | null> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.status) updateData.status = updates.status;
      if (updates.startDate) updateData.startDate = updates.startDate;
      if (updates.endDate) updateData.endDate = updates.endDate;
      if (updates.trafficAllocation) updateData.trafficAllocation = updates.trafficAllocation;
      if (updates.variants) updateData.variants = JSON.stringify(updates.variants);
      if (updates.metrics) updateData.metrics = JSON.stringify(updates.metrics);

      const test = await prisma.aBTest.update({
        where: { id: testId },
        data: updateData
      });

      return {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status as any,
        startDate: test.startDate,
        endDate: test.endDate,
        trafficAllocation: test.trafficAllocation,
        variants: JSON.parse(test.variants),
        metrics: JSON.parse(test.metrics),
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      };
    } catch (error) {
      await logger.error('Error updating A/B test', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Delete A/B test
  async deleteTest(testId: string): Promise<boolean> {
    try {
      await prisma.aBTest.delete({
        where: { id: testId }
      });
      return true;
    } catch (error) {
      await logger.error('Error deleting A/B test', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Assign user to a variant
  async assignUserToVariant(userId: string, testId: string): Promise<ABTestAssignment | null> {
    try {
      // Check if user is already assigned to this test
      const existingAssignment = await prisma.aBTestAssignment.findFirst({
        where: {
          userId,
          testId,
          isActive: true
        }
      });

      if (existingAssignment) {
        return {
          userId: existingAssignment.userId,
          testId: existingAssignment.testId,
          variantId: existingAssignment.variantId,
          assignedAt: existingAssignment.assignedAt,
          isActive: existingAssignment.isActive
        };
      }

      // Get the test
      const test = await this.getTest(testId);
      if (!test || test.status !== 'running') return null;

      // Check if user should be included in test based on traffic allocation
      const userHash = this.hashUserId(userId, testId);
      if (userHash > test.trafficAllocation) return null;

      // Select variant based on traffic allocation
      const variant = this.selectVariant(test.variants);
      if (!variant) return null;

      // Create assignment
      const assignment = await prisma.aBTestAssignment.create({
        data: {
          userId,
          testId,
          variantId: variant.id,
          assignedAt: new Date(),
          isActive: true
        }
      });

      return {
        userId: assignment.userId,
        testId: assignment.testId,
        variantId: assignment.variantId,
        assignedAt: assignment.assignedAt,
        isActive: assignment.isActive
      };
    } catch (error) {
      await logger.error('Error assigning user to variant', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Get user's variant for a test
  async getUserVariant(userId: string, testId: string): Promise<ABTestAssignment | null> {
    try {
      const assignment = await prisma.aBTestAssignment.findFirst({
        where: {
          userId,
          testId,
          isActive: true
        }
      });

      if (!assignment) return null;

      return {
        userId: assignment.userId,
        testId: assignment.testId,
        variantId: assignment.variantId,
        assignedAt: assignment.assignedAt,
        isActive: assignment.isActive
      };
    } catch (error) {
      await logger.error('Error getting user variant', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  // Track conversion for a test
  async trackConversion(userId: string, testId: string, metricName: string, value: number = 1): Promise<boolean> {
    try {
      const assignment = await this.getUserVariant(userId, testId);
      if (!assignment) return false;

      await prisma.aBTestConversion.create({
        data: {
          userId,
          testId,
          variantId: assignment.variantId,
          metricName,
          value,
          convertedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      await logger.error('Error tracking conversion', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Get test results
  async getTestResults(testId: string): Promise<ABTestResult[]> {
    try {
      const test = await this.getTest(testId);
      if (!test) return [];

      const results: ABTestResult[] = [];

      for (const variant of test.variants) {
        const participants = await prisma.aBTestAssignment.count({
          where: {
            testId,
            variantId: variant.id,
            isActive: true
          }
        });

        const conversions = await prisma.aBTestConversion.aggregate({
          where: {
            testId,
            variantId: variant.id
          },
          _sum: {
            value: true
          }
        });

        const conversionValue = conversions._sum.value || 0;
        const conversionRate = participants > 0 ? (conversionValue / participants) * 100 : 0;

        // Calculate revenue (this would be more complex in a real implementation)
        const revenue = await this.calculateRevenue(testId, variant.id);
        const averageOrderValue = conversionValue > 0 ? revenue / conversionValue : 0;

        // Calculate statistical significance (simplified)
        const confidence = this.calculateConfidence(participants, conversionValue);
        const statisticalSignificance = confidence >= 95;

        // Get metrics
        const metrics = await this.getVariantMetrics(testId, variant.id);

        results.push({
          testId,
          variantId: variant.id,
          variantName: variant.name,
          isControl: variant.isControl,
          participants,
          conversions: conversionValue,
          conversionRate,
          revenue,
          averageOrderValue,
          confidence,
          statisticalSignificance,
          metrics
        });
      }

      return results;
    } catch (error) {
      await logger.error('Error getting test results', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  // Start a test
  async startTest(testId: string): Promise<boolean> {
    try {
      const test = await this.getTest(testId);
      if (!test || test.status !== 'draft') return false;

      await this.updateTest(testId, {
        status: 'running',
        startDate: new Date()
      });

      return true;
    } catch (error) {
      await logger.error('Error starting test', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Pause a test
  async pauseTest(testId: string): Promise<boolean> {
    try {
      const test = await this.getTest(testId);
      if (!test || test.status !== 'running') return false;

      await this.updateTest(testId, {
        status: 'paused'
      });

      return true;
    } catch (error) {
      await logger.error('Error pausing test', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Complete a test
  async completeTest(testId: string): Promise<boolean> {
    try {
      const test = await this.getTest(testId);
      if (!test || test.status !== 'running') return false;

      await this.updateTest(testId, {
        status: 'completed',
        endDate: new Date()
      });

      return true;
    } catch (error) {
      await logger.error('Error completing test', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  // Helper methods
  private hashUserId(userId: string, testId: string): number {
    const hash = this.simpleHash(userId + testId);
    return hash % 100;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private selectVariant(variants: ABTestVariant[]): ABTestVariant | null {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.trafficAllocation;
      if (random <= cumulative) {
        return variant;
      }
    }

    return variants[0] || null;
  }

  private calculateConfidence(participants: number, conversions: number): number {
    if (participants === 0) return 0;
    
    const conversionRate = conversions / participants;
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / participants);
    const marginOfError = 1.96 * standardError; // 95% confidence interval
    
    return Math.max(0, Math.min(100, (1 - marginOfError) * 100));
  }

  private async calculateRevenue(testId: string, variantId: string): Promise<number> {
    // This would calculate revenue based on conversions
    // For now, return a simplified calculation
    const conversions = await prisma.aBTestConversion.aggregate({
      where: {
        testId,
        variantId,
        metricName: 'purchase'
      },
      _sum: {
        value: true
      }
    });

    return (conversions._sum.value || 0) * 50; // Assuming average order value of $50
  }

  private async getVariantMetrics(testId: string, variantId: string): Promise<Record<string, number>> {
    const metrics = await prisma.aBTestConversion.groupBy({
      by: ['metricName'],
      where: {
        testId,
        variantId
      },
      _sum: {
        value: true
      }
    });

    const result: Record<string, number> = {};
    for (const metric of metrics) {
      result[metric.metricName] = metric._sum.value || 0;
    }

    return result;
  }
}

export const abTesting = new ABTestingService();
