-- ULICA Project Database Schema
-- PostgreSQL tables for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
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
CREATE TABLE IF NOT EXISTS "categories" (
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
CREATE TABLE IF NOT EXISTS "products" (
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
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT UNIQUE,
    "barcodeUrl" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "costPrice" DECIMAL(10,2),
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
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_products_sku" ON "products"("sku");
CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items"("orderId");

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
