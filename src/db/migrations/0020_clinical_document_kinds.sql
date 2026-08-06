CREATE TYPE "public"."clinical_document_kind" AS ENUM('prescription', 'attendance_declaration', 'medical_certificate', 'exam_request');--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "kind" "clinical_document_kind" DEFAULT 'prescription' NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_appointment_kind_idx" ON "prescriptions" USING btree ("clinic_id","appointment_id","kind");
