-- Hide six products from the shop for now (they stay in the console, switched
-- off, and can be turned back on there).
UPDATE "Product" SET "isAvailable" = false WHERE "id" IN (
  'prod-pistachio-butter',
  'prod-marinated-sardines',
  'prod-pomegranate-concentrate',
  'prod-hard-cheese',
  'prod-marinated-tuna',
  'prod-marinated-octopus'
);
