CREATE TYPE "public"."clinical_alert_kind" AS ENUM('allergy', 'restriction', 'attention', 'other');--> statement-breakpoint
CREATE TYPE "public"."clinical_alert_severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "patient_clinical_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" "clinical_alert_kind" NOT NULL,
	"label" text NOT NULL,
	"severity" "clinical_alert_severity" DEFAULT 'medium' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "patient_clinical_alerts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "patient_clinical_alerts" ADD CONSTRAINT "patient_clinical_alerts_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_clinical_alerts" ADD CONSTRAINT "patient_clinical_alerts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_clinical_alerts_clinic_patient_idx" ON "patient_clinical_alerts" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE INDEX "patient_clinical_alerts_clinic_kind_idx" ON "patient_clinical_alerts" USING btree ("clinic_id","kind");--> statement-breakpoint
CREATE POLICY "patient_clinical_alerts_tenant_isolation" ON "patient_clinical_alerts" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("patient_clinical_alerts"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("patient_clinical_alerts"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);