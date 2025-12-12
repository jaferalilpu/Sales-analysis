-- ULICA Project Database Schema Update
-- PostgreSQL tables for Supabase - Matching Prisma Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to recreate with correct schema)
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'customer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Products table
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "shortDescription" TEXT,
    "sku" TEXT UNIQUE,
    "barcodeUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDigital" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "tags" TEXT[],
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Product variants table
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT UNIQUE,
    "barcodeUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Orders table
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Order items table
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "idx_products_category" ON "products"("categoryId");
CREATE INDEX "idx_products_sku" ON "products"("sku");
CREATE INDEX "idx_orders_user" ON "orders"("userId");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_order_items_order" ON "order_items"("orderId");

-- Insert sample data
INSERT INTO "categories" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt") VALUES 
('cat-1', 'Electronics', 'electronics', 'Electronic devices and accessories', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-2', 'Clothing', 'clothing', 'Fashion and apparel', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-3', 'Home & Garden', 'home-garden', 'Home improvement and gardening', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "users" ("id", "email", "password", "firstName", "lastName", "role", "isEmailVerified", "createdAt", "updatedAt") VALUES 
('user-1', 'admin@ulica.com', '$2b$10$example', 'Admin', 'User', 'admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'customer@ulica.com', '$2b$10$example', 'John', 'Doe', 'customer', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

COMMIT;
