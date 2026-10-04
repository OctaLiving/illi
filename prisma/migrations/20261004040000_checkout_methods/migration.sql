-- Checkout now records how the customer pays (card, crypto or cash on delivery)
-- and where the order is delivered. Existing rows were all crypto.

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'crypto',
ADD COLUMN     "shipping" JSONB;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'crypto',
ADD COLUMN     "shipping" JSONB;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "codEnabled" BOOLEAN NOT NULL DEFAULT true;
