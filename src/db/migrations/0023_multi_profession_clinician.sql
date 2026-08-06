-- ADR-012: multi-profession — profession_type, councils, pronouns, doctor → clinician

CREATE TYPE "public"."profession_type" AS ENUM(
  'physician',
  'dentist',
  'physiotherapist',
  'nurse',
  'pharmacist',
  'psychologist',
  'other'
);--> statement-breakpoint

ALTER TYPE "public"."council_type" ADD VALUE 'CREFITO';--> statement-breakpoint
ALTER TYPE "public"."council_type" ADD VALUE 'CRP';--> statement-breakpoint

ALTER TYPE "public"."treatment_pronoun" ADD VALUE 'ft';--> statement-breakpoint
ALTER TYPE "public"."treatment_pronoun" ADD VALUE 'fta';--> statement-breakpoint

ALTER TABLE "professionals" ADD COLUMN "profession_type" "profession_type";--> statement-breakpoint

UPDATE "professionals"
SET "profession_type" = CASE
  WHEN "council_type" = 'CRO' THEN 'dentist'::"profession_type"
  WHEN "council_type" = 'COREN' THEN 'nurse'::"profession_type"
  WHEN "council_type" = 'CRF' THEN 'pharmacist'::"profession_type"
  WHEN "council_type" = 'CREFITO' THEN 'physiotherapist'::"profession_type"
  WHEN "council_type" = 'CRP' THEN 'psychologist'::"profession_type"
  WHEN "council_type" = 'CRM' THEN 'physician'::"profession_type"
  ELSE 'other'::"profession_type"
END
WHERE "profession_type" IS NULL;--> statement-breakpoint

ALTER TABLE "professionals"
  ALTER COLUMN "profession_type" SET DEFAULT 'physician'::"profession_type";--> statement-breakpoint

ALTER TABLE "professionals"
  ALTER COLUMN "profession_type" SET NOT NULL;--> statement-breakpoint

UPDATE "roles"
SET
  "key" = 'clinician',
  "name" = 'Profissional de saúde',
  "description" = 'Profissional de saúde com acesso de escrita clínica'
WHERE "key" = 'doctor' AND "clinic_id" IS NULL AND "is_system" = true;
