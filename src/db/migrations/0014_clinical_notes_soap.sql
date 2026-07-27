ALTER TABLE "clinical_notes" ADD COLUMN "subjective" text;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD COLUMN "objective" text;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD COLUMN "assessment" text;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "clinical_notes" ADD COLUMN "cid_codes" jsonb DEFAULT '[]'::jsonb NOT NULL;
