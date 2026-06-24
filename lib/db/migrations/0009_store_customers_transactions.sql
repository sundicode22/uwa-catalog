DO $$ BEGIN
  CREATE TYPE "public"."store_transaction_type" AS ENUM('sale', 'refund');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."store_transaction_status" AS ENUM('pending', 'completed', 'voided');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_customers" (
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
DO $$ BEGIN
  ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "store_customers_store_phone_idx" ON "store_customers" ("store_id", "phone_normalized");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_customers_store_idx" ON "store_customers" ("store_id");
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_id" text;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_store_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."store_customers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_customer_idx" ON "orders" ("customer_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_transactions" (
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
DO $$ BEGIN
  ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_customer_id_store_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."store_customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "store_transactions_order_idx" ON "store_transactions" ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_transactions_store_idx" ON "store_transactions" ("store_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_transactions_customer_idx" ON "store_transactions" ("customer_id");
