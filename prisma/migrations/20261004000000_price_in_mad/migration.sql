-- Prices move to Moroccan dirhams (MAD). Customers still pay in crypto; the
-- gateway converts from the MAD price at checkout.

-- AlterTable
ALTER TABLE "Plan" ALTER COLUMN "priceCurrency" SET DEFAULT 'MAD';

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "currency" SET DEFAULT 'MAD';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "currency" SET DEFAULT 'MAD';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'MAD';

-- Convert existing plan prices from the old currency at ≈ 9.35 MAD per unit, rounded
-- to the nearest 10 MAD.
-- Existing subscriptions, orders and payments keep the currency they were sold in.
UPDATE "Plan"
SET "priceAmount" = (ROUND("priceAmount" * 9.35 / 10) * 10)::INTEGER,
    "priceCurrency" = 'MAD'
WHERE "priceCurrency" = 'USDT';
