-- ADR-003: subscriptions payer = user (not clinic)
DROP POLICY IF EXISTS "subscriptions_tenant_isolation" ON "subscriptions";--> statement-breakpoint
DROP POLICY IF EXISTS "subscriptions_insert_onboarding" ON "subscriptions";--> statement-breakpoint
DROP INDEX IF EXISTS "subscriptions_clinic_active_uidx";--> statement-breakpoint
DROP INDEX IF EXISTS "subscriptions_clinic_id_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "user_id" text;--> statement-breakpoint
UPDATE "subscriptions" AS s
SET "user_id" = m."user_id"
FROM "clinic_memberships" AS m
INNER JOIN "roles" AS r ON r."id" = m."role_id"
WHERE m."clinic_id" = s."clinic_id"
  AND r."key" = 'owner'
  AND m."deleted_at" IS NULL
  AND s."user_id" IS NULL;--> statement-breakpoint
DELETE FROM "subscriptions" WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_clinic_id_clinics_id_fk";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "clinic_id";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_active_uidx" ON "subscriptions" USING btree ("user_id") WHERE "subscriptions"."deleted_at" IS NULL AND "subscriptions"."status" IN ('trialing', 'active', 'past_due');--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_gateway_customer_uidx" ON "subscriptions" USING btree ("gateway_customer_id") WHERE "subscriptions"."gateway_customer_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "subscriptions_owner_isolation" ON "subscriptions" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("subscriptions"."user_id" = nullif(current_setting('app.user_id', true), '')) WITH CHECK ("subscriptions"."user_id" = nullif(current_setting('app.user_id', true), ''));--> statement-breakpoint
CREATE POLICY "subscriptions_insert_onboarding" ON "subscriptions" AS PERMISSIVE FOR INSERT TO "sclinic_app" WITH CHECK (true);--> statement-breakpoint
CREATE TABLE "stripe_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" text NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_webhook_events_stripe_event_id_uidx" ON "stripe_webhook_events" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "stripe_webhook_events_type_idx" ON "stripe_webhook_events" USING btree ("type");
