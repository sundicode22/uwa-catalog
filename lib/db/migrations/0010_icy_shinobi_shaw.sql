CREATE TYPE "public"."store_transaction_status" AS ENUM('pending', 'completed', 'voided');--> statement-breakpoint
CREATE TYPE "public"."store_transaction_type" AS ENUM('sale', 'refund');--> statement-breakpoint
CREATE TABLE "billing_plan_definitions" (
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
CREATE TABLE "store_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"phone_normalized" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"region" text,
	"notes" text,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" text DEFAULT '0' NOT NULL,
	"last_order_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"order_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"type" "store_transaction_type" DEFAULT 'sale' NOT NULL,
	"status" "store_transaction_status" DEFAULT 'pending' NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text,
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_customer_id_store_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."store_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "store_customers_store_phone_idx" ON "store_customers" USING btree ("store_id","phone_normalized");--> statement-breakpoint
CREATE INDEX "store_customers_store_idx" ON "store_customers" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_transactions_order_idx" ON "store_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "store_transactions_store_idx" ON "store_transactions" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "store_transactions_customer_idx" ON "store_transactions" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_store_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."store_customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");