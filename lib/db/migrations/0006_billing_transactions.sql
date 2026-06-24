DO $$ BEGIN
  CREATE TYPE "public"."billing_transaction_status" AS ENUM('pending', 'processing', 'complete', 'failed', 'canceled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_customers" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "provider" "billing_provider" NOT NULL,
  "external_customer_id" text,
  "external_reference" text,
  "email" text,
  "name" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "provider" "billing_provider" NOT NULL,
  "plan" "subscription_plan" NOT NULL,
  "status" "billing_transaction_status" DEFAULT 'pending' NOT NULL,
  "currency" text NOT NULL,
  "amount" integer NOT NULL,
  "external_transaction_id" text,
  "external_customer_id" text,
  "external_reference" text NOT NULL,
  "checkout_url" text,
  "payment_method" text,
  "paid_at" timestamp,
  "last_payload" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "billing_transactions" ADD CONSTRAINT "billing_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "billing_customers_user_provider_idx" ON "billing_customers" USING btree ("user_id","provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_customers_provider_ref_idx" ON "billing_customers" USING btree ("provider","external_reference");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "billing_transactions_reference_idx" ON "billing_transactions" USING btree ("external_reference");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "billing_transactions_provider_transaction_idx" ON "billing_transactions" USING btree ("provider","external_transaction_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_transactions_user_idx" ON "billing_transactions" USING btree ("user_id");
