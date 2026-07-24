CREATE TABLE "vital_signs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"professional_id" uuid,
	"systolic_mm_hg" integer,
	"diastolic_mm_hg" integer,
	"heart_rate_bpm" integer,
	"respiratory_rate" integer,
	"temperature_c" double precision,
	"weight_kg" double precision,
	"height_cm" double precision,
	"spo2_percent" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "vital_signs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vital_signs_clinic_patient_idx" ON "vital_signs" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE INDEX "vital_signs_clinic_appointment_idx" ON "vital_signs" USING btree ("clinic_id","appointment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vital_signs_appointment_uidx" ON "vital_signs" USING btree ("appointment_id") WHERE "vital_signs"."deleted_at" IS NULL;--> statement-breakpoint
CREATE POLICY "vital_signs_tenant_isolation" ON "vital_signs" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("vital_signs"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("vital_signs"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);