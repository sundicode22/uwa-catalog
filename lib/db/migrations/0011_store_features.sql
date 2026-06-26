DO $$ BEGIN
  CREATE TYPE "public"."fulfillment_type" AS ENUM('pickup', 'delivery');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."order_payment_status" AS ENUM('not_required', 'unpaid', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "pickup_enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "delivery_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "delivery_fee" text DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "free_delivery_minimum" text;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer DEFAULT 5 NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "notify_on_new_order" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "storefront_payments_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_token" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subtotal" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_fee" text DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_code" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" text DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "fulfillment_type" "fulfillment_type" DEFAULT 'pickup' NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_status" "order_payment_status" DEFAULT 'not_required' NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_reference" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_tracking_token_idx" ON "orders" ("tracking_token");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_discount_codes" (
  "id" text PRIMARY KEY NOT NULL,
  "store_id" text NOT NULL,
  "code" text NOT NULL,
  "type" "discount_type" NOT NULL,
  "value" text NOT NULL,
  "min_order_total" text,
  "max_uses" integer,
  "used_count" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "store_discount_codes_store_code_idx" ON "store_discount_codes" ("store_id","code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_discount_codes_store_idx" ON "store_discount_codes" ("store_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "store_discount_codes" ADD CONSTRAINT "store_discount_codes_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
