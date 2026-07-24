CREATE TABLE "clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"professional_id" uuid,
	"content" jsonb NOT NULL,
	"plain_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "clinical_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinical_notes_clinic_patient_idx" ON "clinical_notes" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE INDEX "clinical_notes_clinic_appointment_idx" ON "clinical_notes" USING btree ("clinic_id","appointment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clinical_notes_appointment_uidx" ON "clinical_notes" USING btree ("appointment_id") WHERE "clinical_notes"."deleted_at" IS NULL;--> statement-breakpoint
CREATE POLICY "clinical_notes_tenant_isolation" ON "clinical_notes" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("clinical_notes"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("clinical_notes"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);