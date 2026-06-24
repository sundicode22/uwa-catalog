DO $$ BEGIN
  CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'basic', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."billing_provider" AS ENUM('none', 'stripe', 'notchpay');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
  "user_id" text PRIMARY KEY NOT NULL,
  "plan" "subscription_plan" DEFAULT 'free' NOT NULL,
  "status" "subscription_status" DEFAULT 'active' NOT NULL,
  "provider" "billing_provider" DEFAULT 'none' NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "notchpay_customer_ref" text,
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "cancel_at_period_end" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "user_subscriptions" ("user_id", "plan", "status", "provider")
SELECT "id", 'free', 'active', 'none' FROM "users"
ON CONFLICT ("user_id") DO NOTHING;
