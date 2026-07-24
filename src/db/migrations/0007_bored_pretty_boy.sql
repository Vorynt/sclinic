CREATE TYPE "public"."audit_status" AS ENUM('success', 'error');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"actor_user_id" text,
	"actor_name" text,
	"actor_email" text,
	"action" text NOT NULL,
	"status" "audit_status" NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"changes" jsonb,
	"error_message" text,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_clinic_created_at_idx" ON "audit_logs" USING btree ("clinic_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_clinic_entity_idx" ON "audit_logs" USING btree ("clinic_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_clinic_status_idx" ON "audit_logs" USING btree ("clinic_id","status");--> statement-breakpoint
CREATE POLICY "audit_logs_tenant_isolation" ON "audit_logs" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("audit_logs"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("audit_logs"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);