-- AlterTable
ALTER TABLE "reorder_points" RENAME COLUMN "threshold" TO "minQuantity";
ALTER TABLE "reorder_points" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "reorder_points" ADD COLUMN     "maxQuantity" INTEGER;

-- CreateTable
CREATE TABLE "drops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bannerImage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "purchaseLimitPerCustomer" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_products" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drop_products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "drop_products_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "drops"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drop_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drop_purchases" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drop_purchases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "drop_purchases_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "drops"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drop_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drop_purchases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_alerts" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "reorderPoint" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "inventory_alerts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_alerts_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "drops_slug_key" ON "drops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "drop_products_dropId_productId_key" ON "drop_products"("dropId", "productId");

-- CreateIndex
CREATE INDEX "inventory_alerts_variantId_status_idx" ON "inventory_alerts"("variantId", "status");

