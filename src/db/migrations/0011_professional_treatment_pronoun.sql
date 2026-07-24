CREATE TYPE "public"."treatment_pronoun" AS ENUM('dr', 'dra', 'sr', 'sra', 'enf', 'enfa');--> statement-breakpoint
ALTER TABLE "professionals" ALTER COLUMN "full_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "treatment_pronoun" "treatment_pronoun";