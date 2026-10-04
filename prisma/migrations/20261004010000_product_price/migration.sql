-- Products can be bought one at a time, outside a subscription. Each gets a
-- one-time price in MAD; existing products start at their category's default.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "priceAmount" INTEGER NOT NULL DEFAULT 0;

UPDATE "Product"
SET "priceAmount" = CASE "eligibleSlotTypes"[1]
    WHEN 'beverages' THEN 130
    WHEN 'dairy' THEN 170
    WHEN 'vegetables' THEN 140
    WHEN 'spreads' THEN 170
    WHEN 'jams' THEN 150
    WHEN 'seafood' THEN 280
    WHEN 'sauces' THEN 140
    ELSE 150
END;
