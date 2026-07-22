CREATE TYPE "public"."appointment_type" AS ENUM('consultation', 'follow_up', 'procedure', 'evaluation', 'other');--> statement-breakpoint
CREATE TYPE "public"."patient_gender" AS ENUM('female', 'male', 'other', 'undisclosed');--> statement-breakpoint
CREATE TABLE "clinic_business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "clinic_business_hours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_street" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_number" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_complement" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_neighborhood" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_city" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_state" text;--> statement-breakpoint
ALTER TABLE "clinics" ADD COLUMN "address_zip" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "social_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "gender" "patient_gender";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact_phone" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_street" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_number" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_complement" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_neighborhood" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_city" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_state" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address_zip" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "type" "appointment_type" DEFAULT 'consultation' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "canceled_reason" text;--> statement-breakpoint
ALTER TABLE "clinic_business_hours" ADD CONSTRAINT "clinic_business_hours_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clinic_business_hours_clinic_day_uidx" ON "clinic_business_hours" USING btree ("clinic_id","day_of_week") WHERE "clinic_business_hours"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "clinic_business_hours_clinic_id_idx" ON "clinic_business_hours" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "appointments_clinic_status_starts_idx" ON "appointments" USING btree ("clinic_id","status","starts_at");--> statement-breakpoint
CREATE POLICY "clinic_business_hours_tenant_isolation" ON "clinic_business_hours" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("clinic_business_hours"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("clinic_business_hours"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);