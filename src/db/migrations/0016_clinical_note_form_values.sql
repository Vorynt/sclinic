ALTER TABLE "clinical_notes" ADD COLUMN "template_id" text;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD COLUMN "form_values" jsonb;
