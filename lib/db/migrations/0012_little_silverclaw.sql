CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."order_payment_status" AS ENUM('not_required', 'unpaid', 'paid');--> statement-breakpoint
CREATE TABLE "store_discount_codes" (
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
ALTER TABLE "orders" ADD COLUMN "subtotal" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_fee" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_type" "fulfillment_type" DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "order_payment_status" DEFAULT 'not_required' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_token" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "pickup_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "delivery_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "delivery_fee" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "free_delivery_minimum" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "low_stock_threshold" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "notify_on_new_order" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "storefront_payments_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_discount_codes" ADD CONSTRAINT "store_discount_codes_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "store_discount_codes_store_code_idx" ON "store_discount_codes" USING btree ("store_id","code");--> statement-breakpoint
CREATE INDEX "store_discount_codes_store_idx" ON "store_discount_codes" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_tracking_token_idx" ON "orders" USING btree ("tracking_token");