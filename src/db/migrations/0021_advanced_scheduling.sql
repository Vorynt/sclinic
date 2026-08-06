CREATE TYPE "public"."appointment_modality" AS ENUM('in_person', 'online');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'promoted', 'canceled');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "modality" "appointment_modality" DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
CREATE TABLE "schedule_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "schedule_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "professional_business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"second_opens_at" time,
	"second_closes_at" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "professional_business_hours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "appointment_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"professional_id" uuid,
	"service_id" uuid,
	"status" "waitlist_status" DEFAULT 'waiting' NOT NULL,
	"notes" text,
	"promoted_appointment_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "appointment_waitlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_business_hours" ADD CONSTRAINT "professional_business_hours_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_business_hours" ADD CONSTRAINT "professional_business_hours_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_waitlist" ADD CONSTRAINT "appointment_waitlist_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_waitlist" ADD CONSTRAINT "appointment_waitlist_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_waitlist" ADD CONSTRAINT "appointment_waitlist_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_waitlist" ADD CONSTRAINT "appointment_waitlist_service_id_clinic_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."clinic_services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "schedule_blocks_clinic_starts_at_idx" ON "schedule_blocks" USING btree ("clinic_id","starts_at");--> statement-breakpoint
CREATE INDEX "schedule_blocks_clinic_professional_starts_idx" ON "schedule_blocks" USING btree ("clinic_id","professional_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "professional_business_hours_prof_day_uidx" ON "professional_business_hours" USING btree ("clinic_id","professional_id","day_of_week") WHERE "professional_business_hours"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "professional_business_hours_clinic_id_idx" ON "professional_business_hours" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "professional_business_hours_professional_id_idx" ON "professional_business_hours" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "appointment_waitlist_clinic_status_idx" ON "appointment_waitlist" USING btree ("clinic_id","status");--> statement-breakpoint
CREATE INDEX "appointment_waitlist_clinic_professional_status_idx" ON "appointment_waitlist" USING btree ("clinic_id","professional_id","status");--> statement-breakpoint
CREATE INDEX "appointment_waitlist_clinic_patient_idx" ON "appointment_waitlist" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE POLICY "schedule_blocks_tenant_isolation" ON "schedule_blocks" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("schedule_blocks"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("schedule_blocks"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "professional_business_hours_tenant_isolation" ON "professional_business_hours" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("professional_business_hours"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("professional_business_hours"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "appointment_waitlist_tenant_isolation" ON "appointment_waitlist" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("appointment_waitlist"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("appointment_waitlist"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);
