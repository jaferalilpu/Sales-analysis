-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('unfulfilled', 'picked', 'packed', 'shipped', 'delivered', 'cancelled', 'return_initiated', 'returned');

-- Normalize existing data prior to type conversion
UPDATE "orders"
SET "fulfillmentStatus" = 'unfulfilled'
WHERE "fulfillmentStatus" IN ('pending', 'processing', 'ready', 'ready_for_pickup') OR "fulfillmentStatus" IS NULL;

UPDATE "order_fulfillments"
SET "status" = 'unfulfilled'
WHERE "status" IN ('pending', 'processing', 'ready', 'ready_for_pickup') OR "status" IS NULL;

UPDATE "orders"
SET "paymentStatus" = 'pending'
WHERE "paymentStatus" IN ('unpaid', 'awaiting', '') OR "paymentStatus" IS NULL;

-- Alter orders.status to enum
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING "status"::text::"OrderStatus";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';

-- Alter orders.paymentStatus to enum
ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "orders"
  ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
  USING "paymentStatus"::text::"PaymentStatus";
ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';

-- Alter orders.fulfillmentStatus to enum
ALTER TABLE "orders" ALTER COLUMN "fulfillmentStatus" DROP DEFAULT;
ALTER TABLE "orders"
  ALTER COLUMN "fulfillmentStatus" TYPE "FulfillmentStatus"
  USING "fulfillmentStatus"::text::"FulfillmentStatus";
ALTER TABLE "orders" ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'unfulfilled';

-- Alter order_fulfillments.status to enum
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order_fulfillments"
  ALTER COLUMN "status" TYPE "FulfillmentStatus"
  USING "status"::text::"FulfillmentStatus";
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" SET DEFAULT 'unfulfilled';

-- Ensure NOT NULL defaults remain intact
ALTER TABLE "orders" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "fulfillmentStatus" SET NOT NULL;
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" SET NOT NULL;

