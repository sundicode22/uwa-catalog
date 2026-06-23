-- inventory: null = unlimited stock, number = tracked quantity
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "inventory" integer;
