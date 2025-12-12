/**
 * Prisma type helpers for backend
 */

import { Prisma } from '@prisma/client';

/**
 * Get Prisma model type with specific includes
 * Note: Prisma.GetPayload is not available in this version, using direct types instead
 */

/**
 * Common product include type
 */
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
    images: true;
  };
}>;

/**
 * Common order include type
 */
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: {
      include: {
        product: true;
        variant: true;
      };
    };
    addresses: true;
  };
}>;

/**
 * Common user include type
 */
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    addresses: true;
    orders: true;
  };
}>;

/**
 * Order item type with full relations (from OrderWithRelations)
 */
export type OrderItemWithRelations = OrderWithRelations['items'][0];

