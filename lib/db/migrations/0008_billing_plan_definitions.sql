CREATE TABLE IF NOT EXISTS "billing_plan_definitions" (
  "id" "subscription_plan" PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "monthly_price_usd" integer NOT NULL,
  "monthly_price_xaf" integer NOT NULL,
  "max_stores" integer NOT NULL,
  "max_products_per_store" integer NOT NULL,
  "features" jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_popular" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "billing_plan_definitions" (
  "id",
  "name",
  "description",
  "monthly_price_usd",
  "monthly_price_xaf",
  "max_stores",
  "max_products_per_store",
  "features",
  "sort_order",
  "is_popular",
  "is_active"
) VALUES
  (
    'free',
    'Free',
    'Get started with one catalog',
    0,
    0,
    1,
    10,
    '["1 store", "10 products per store", "Basic storefront"]'::jsonb,
    0,
    false,
    true
  ),
  (
    'basic',
    'Basic',
    'For growing sellers',
    9,
    5500,
    3,
    100,
    '["3 stores", "100 products per store", "WhatsApp checkout"]'::jsonb,
    1,
    true,
    true
  ),
  (
    'premium',
    'Premium',
    'For established brands',
    29,
    18000,
    10,
    1000,
    '["10 stores", "1000 products per store", "Premium storefront layouts"]'::jsonb,
    2,
    false,
    true
  )
ON CONFLICT ("id") DO NOTHING;
