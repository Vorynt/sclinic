-- ADR-008: multi-template prescription layouts (DocumentModel + layoutId)
DROP INDEX IF EXISTS "prescription_layouts_clinic_active_uidx";--> statement-breakpoint
DROP INDEX IF EXISTS "prescription_layouts_clinic_version_uidx";--> statement-breakpoint
ALTER TABLE "prescription_layouts" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "prescription_layouts" ADD COLUMN "document_model" jsonb;--> statement-breakpoint
ALTER TABLE "prescription_layouts" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Backfill active rows as named default templates with system DocumentModel shape.
UPDATE "prescription_layouts"
SET
  "name" = COALESCE("name", 'Personalizado'),
  "is_default" = CASE WHEN "is_active" = true AND "deleted_at" IS NULL THEN true ELSE false END,
  "document_model" = COALESCE(
    "document_model",
    '{"version":1,"blocks":[{"id":"a1111111-1111-4111-8111-111111111111","type":"letterhead","props":{"align":"center","showDocument":true,"showAddress":true,"showPhone":true,"showEmail":true}},{"id":"a2222222-2222-4222-8222-222222222222","type":"title","props":{"text":"Receita médica","align":"center"}},{"id":"a3333333-3333-4333-8333-333333333333","type":"patient","props":{"align":"left","showDocument":true}},{"id":"a4444444-4444-4444-8444-444444444444","type":"body","props":{"align":"left","minHeightMm":140}},{"id":"a5555555-5555-4555-8555-555555555555","type":"professional","props":{"align":"center","showCouncil":true,"showSpecialty":true,"showIssuedAt":true,"showSignLine":true}}]}'::jsonb
  )
WHERE "document_model" IS NULL OR "name" IS NULL;--> statement-breakpoint
-- Ensure at most one default per clinic among active rows (keep newest).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY clinic_id
      ORDER BY version DESC, updated_at DESC
    ) AS rn
  FROM prescription_layouts
  WHERE deleted_at IS NULL AND is_active = true AND is_default = true
)
UPDATE prescription_layouts pl
SET is_default = false
FROM ranked r
WHERE pl.id = r.id AND r.rn > 1;--> statement-breakpoint
ALTER TABLE "prescription_layouts" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription_layouts" ALTER COLUMN "document_model" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "prescription_layouts_clinic_default_uidx" ON "prescription_layouts" USING btree ("clinic_id") WHERE "prescription_layouts"."deleted_at" IS NULL AND "prescription_layouts"."is_active" = true AND "prescription_layouts"."is_default" = true;--> statement-breakpoint
CREATE INDEX "prescription_layouts_clinic_active_idx" ON "prescription_layouts" USING btree ("clinic_id") WHERE "prescription_layouts"."deleted_at" IS NULL AND "prescription_layouts"."is_active" = true;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "layout_id" uuid;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_layout_id_prescription_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."prescription_layouts"("id") ON DELETE set null ON UPDATE no action;
