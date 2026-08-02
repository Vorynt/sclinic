CREATE TYPE "public"."charge_billing_kind" AS ENUM('standard', 'courtesy', 'return');--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'courtesy';--> statement-breakpoint
CREATE TABLE "clinic_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);--> statement-breakpoint
ALTER TABLE "clinic_services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinic_services_clinic_active_idx" ON "clinic_services" USING btree ("clinic_id","is_active");--> statement-breakpoint
CREATE INDEX "clinic_services_clinic_name_idx" ON "clinic_services" USING btree ("clinic_id","name");--> statement-breakpoint
CREATE POLICY "clinic_services_tenant_isolation" ON "clinic_services" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("clinic_services"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("clinic_services"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_clinic_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."clinic_services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_clinic_service_idx" ON "appointments" USING btree ("clinic_id","service_id");--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "service_name" text;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "list_amount_cents" integer;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "discount_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "billing_kind" "charge_billing_kind" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_service_id_clinic_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."clinic_services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "charges_clinic_service_idx" ON "charges" USING btree ("clinic_id","service_id");
