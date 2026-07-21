CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sclinic_app') THEN
    CREATE ROLE sclinic_app NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;--> statement-breakpoint
CREATE TYPE "public"."affiliation_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."affiliation_type" AS ENUM('attending', 'coordinator', 'locum', 'resident');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'checked_in', 'completed', 'canceled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."clinic_subscription_status" AS ENUM('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."council_type" AS ENUM('CRM', 'CRO', 'COREN', 'CRF', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked', 'resent');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('active', 'invited', 'suspended', 'removed');--> statement-breakpoint
CREATE TYPE "public"."patient_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."professional_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_clinic_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"trade_name" text,
	"document" text,
	"email" text,
	"phone" text,
	"logo_url" text,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"subscription_status" "clinic_subscription_status" DEFAULT 'none' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "clinics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "clinic_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"clinic_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "membership_status" DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "clinic_memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role_id" uuid NOT NULL,
	"invited_by" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "professional_clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid NOT NULL,
	"clinic_id" uuid NOT NULL,
	"affiliation_type" "affiliation_type" DEFAULT 'attending' NOT NULL,
	"status" "affiliation_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "professional_clinics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"full_name" text NOT NULL,
	"council_type" "council_type",
	"council_number" text,
	"council_state" text,
	"specialty" text,
	"biography" text,
	"status" "professional_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"max_users" integer,
	"max_professionals" integer,
	"max_storage_bytes" integer,
	"stripe_price_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"gateway" text DEFAULT 'stripe' NOT NULL,
	"gateway_customer_id" text,
	"gateway_subscription_id" text,
	"status" "subscription_status" DEFAULT 'incomplete' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"document" text,
	"email" text,
	"phone" text,
	"birth_date" date,
	"status" "patient_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"professional_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_clinics" ADD CONSTRAINT "professional_clinics_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_clinics" ADD CONSTRAINT "professional_clinics_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "clinics_document_uidx" ON "clinics" USING btree ("document") WHERE "clinics"."document" IS NOT NULL AND "clinics"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "clinics_subscription_status_idx" ON "clinics" USING btree ("subscription_status");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_key_uidx" ON "permissions" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_role_permission_uidx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_system_key_uidx" ON "roles" USING btree ("key") WHERE "roles"."clinic_id" IS NULL AND "roles"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "roles_clinic_key_uidx" ON "roles" USING btree ("clinic_id","key") WHERE "roles"."clinic_id" IS NOT NULL AND "roles"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "roles_clinic_id_idx" ON "roles" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clinic_memberships_user_clinic_uidx" ON "clinic_memberships" USING btree ("user_id","clinic_id") WHERE "clinic_memberships"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "clinic_memberships_user_default_uidx" ON "clinic_memberships" USING btree ("user_id") WHERE "clinic_memberships"."is_default" = true AND "clinic_memberships"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "clinic_memberships_clinic_id_idx" ON "clinic_memberships" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "clinic_memberships_user_id_idx" ON "clinic_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clinic_memberships_role_id_idx" ON "clinic_memberships" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_hash_uidx" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invitations_clinic_email_status_idx" ON "invitations" USING btree ("clinic_id","email","status");--> statement-breakpoint
CREATE INDEX "invitations_expires_at_idx" ON "invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "professional_clinics_professional_clinic_uidx" ON "professional_clinics" USING btree ("professional_id","clinic_id") WHERE "professional_clinics"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "professional_clinics_clinic_id_idx" ON "professional_clinics" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "professionals_user_id_uidx" ON "professionals" USING btree ("user_id") WHERE "professionals"."user_id" IS NOT NULL AND "professionals"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "professionals_council_uidx" ON "professionals" USING btree ("council_type","council_number","council_state") WHERE "professionals"."council_type" IS NOT NULL
          AND "professionals"."council_number" IS NOT NULL
          AND "professionals"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "professionals_status_idx" ON "professionals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_stripe_price_id_uidx" ON "plans" USING btree ("stripe_price_id") WHERE "plans"."stripe_price_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "plans_is_active_idx" ON "plans" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_clinic_active_uidx" ON "subscriptions" USING btree ("clinic_id") WHERE "subscriptions"."deleted_at" IS NULL AND "subscriptions"."status" IN ('trialing', 'active', 'past_due');--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_gateway_subscription_uidx" ON "subscriptions" USING btree ("gateway_subscription_id") WHERE "subscriptions"."gateway_subscription_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "subscriptions_clinic_id_idx" ON "subscriptions" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "patients_clinic_id_idx" ON "patients" USING btree ("clinic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_clinic_document_uidx" ON "patients" USING btree ("clinic_id","document") WHERE "patients"."document" IS NOT NULL AND "patients"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "patients_clinic_full_name_idx" ON "patients" USING btree ("clinic_id","full_name");--> statement-breakpoint
CREATE INDEX "appointments_clinic_starts_at_idx" ON "appointments" USING btree ("clinic_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_clinic_professional_starts_idx" ON "appointments" USING btree ("clinic_id","professional_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_clinic_patient_idx" ON "appointments" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE POLICY "clinics_member_access" ON "clinics" AS PERMISSIVE FOR SELECT TO "sclinic_app" USING ((
    "clinics"."id" = nullif(current_setting('app.clinic_id', true), '')::uuid
    OR EXISTS (
      SELECT 1
      FROM clinic_memberships m
      WHERE m.clinic_id = "clinics"."id"
        AND m.user_id = nullif(current_setting('app.user_id', true), '')
        AND m.deleted_at IS NULL
        AND m.status = 'active'
    )
  ));--> statement-breakpoint
CREATE POLICY "clinics_tenant_write" ON "clinics" AS PERMISSIVE FOR UPDATE TO "sclinic_app" USING ("clinics"."id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("clinics"."id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "clinic_memberships_tenant_isolation" ON "clinic_memberships" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ((
    "clinic_memberships"."user_id" = nullif(current_setting('app.user_id', true), '')
    OR "clinic_memberships"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid
  )) WITH CHECK ((
    "clinic_memberships"."user_id" = nullif(current_setting('app.user_id', true), '')
    OR "clinic_memberships"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid
  ));--> statement-breakpoint
CREATE POLICY "invitations_tenant_isolation" ON "invitations" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("invitations"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("invitations"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "professional_clinics_tenant_isolation" ON "professional_clinics" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("professional_clinics"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("professional_clinics"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "subscriptions_tenant_isolation" ON "subscriptions" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("subscriptions"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("subscriptions"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "patients_tenant_isolation" ON "patients" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("patients"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("patients"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "appointments_tenant_isolation" ON "appointments" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("appointments"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("appointments"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
ALTER TABLE "clinics" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinic_memberships" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "professional_clinics" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patients" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "appointments" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO sclinic_app;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sclinic_app;--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sclinic_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sclinic_app;--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO sclinic_app;