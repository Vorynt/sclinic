CREATE TABLE "clinic_calendar_settings" (
	"clinic_id" uuid PRIMARY KEY NOT NULL,
	"settings" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinic_calendar_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinic_calendar_settings" ADD CONSTRAINT "clinic_calendar_settings_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "clinic_calendar_settings_tenant_isolation" ON "clinic_calendar_settings" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("clinic_calendar_settings"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("clinic_calendar_settings"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
ALTER TABLE "clinic_calendar_settings" FORCE ROW LEVEL SECURITY;
