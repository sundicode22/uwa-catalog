ALTER TABLE "product_variation_options" ADD COLUMN IF NOT EXISTS "image" jsonb;
ALTER TABLE "product_modifier_options" ADD COLUMN IF NOT EXISTS "image" jsonb;
