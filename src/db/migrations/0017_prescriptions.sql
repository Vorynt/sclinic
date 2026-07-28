CREATE TYPE "public"."prescription_status" AS ENUM('draft', 'issued');--> statement-breakpoint
CREATE TABLE "prescription_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"html" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "prescription_layouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"professional_id" uuid,
	"status" "prescription_status" DEFAULT 'draft' NOT NULL,
	"body" text NOT NULL,
	"plain_text" text NOT NULL,
	"layout_html" text,
	"layout_version" integer,
	"clinic_snapshot" jsonb,
	"patient_snapshot" jsonb,
	"professional_snapshot" jsonb,
	"issued_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "prescriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prescription_layouts" ADD CONSTRAINT "prescription_layouts_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_layouts_clinic_version_uidx" ON "prescription_layouts" USING btree ("clinic_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_layouts_clinic_active_uidx" ON "prescription_layouts" USING btree ("clinic_id") WHERE "prescription_layouts"."deleted_at" IS NULL AND "prescription_layouts"."is_active" = true;--> statement-breakpoint
CREATE INDEX "prescription_layouts_clinic_idx" ON "prescription_layouts" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_patient_idx" ON "prescriptions" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_appointment_idx" ON "prescriptions" USING btree ("clinic_id","appointment_id");--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_status_idx" ON "prescriptions" USING btree ("clinic_id","status");--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_issued_at_idx" ON "prescriptions" USING btree ("clinic_id","issued_at");--> statement-breakpoint
CREATE POLICY "prescription_layouts_tenant_isolation" ON "prescription_layouts" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("prescription_layouts"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("prescription_layouts"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "prescriptions_tenant_isolation" ON "prescriptions" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("prescriptions"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("prescriptions"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);
