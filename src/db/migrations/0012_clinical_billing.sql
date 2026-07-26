CREATE TYPE "public"."charge_status" AS ENUM('pending', 'paid', 'canceled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'pix_manual', 'card', 'transfer', 'other', 'gateway');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('none', 'asaas');--> statement-breakpoint
CREATE TABLE "charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"status" charge_status DEFAULT 'pending' NOT NULL,
	"description" text,
	"due_at" timestamp with time zone,
	"provider" "payment_provider" DEFAULT 'none' NOT NULL,
	"provider_charge_id" text,
	"provider_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "charges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"charge_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"method" "payment_method" NOT NULL,
	"paid_at" timestamp with time zone NOT NULL,
	"provider" "payment_provider" DEFAULT 'none' NOT NULL,
	"provider_payment_id" text,
	"notes" text,
	"recorded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "charges_appointment_active_uidx" ON "charges" USING btree ("appointment_id") WHERE "charges"."deleted_at" IS NULL AND "charges"."status" <> 'canceled';--> statement-breakpoint
CREATE UNIQUE INDEX "charges_provider_charge_id_uidx" ON "charges" USING btree ("provider","provider_charge_id") WHERE "charges"."provider_charge_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "charges_clinic_status_idx" ON "charges" USING btree ("clinic_id","status");--> statement-breakpoint
CREATE INDEX "charges_clinic_patient_idx" ON "charges" USING btree ("clinic_id","patient_id");--> statement-breakpoint
CREATE INDEX "charges_clinic_created_at_idx" ON "charges" USING btree ("clinic_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_payment_id_uidx" ON "payments" USING btree ("provider","provider_payment_id") WHERE "payments"."provider_payment_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "payments_clinic_charge_idx" ON "payments" USING btree ("clinic_id","charge_id");--> statement-breakpoint
CREATE INDEX "payments_clinic_paid_at_idx" ON "payments" USING btree ("clinic_id","paid_at");--> statement-breakpoint
CREATE POLICY "charges_tenant_isolation" ON "charges" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("charges"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("charges"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "payments_tenant_isolation" ON "payments" AS PERMISSIVE FOR ALL TO "sclinic_app" USING ("payments"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid) WITH CHECK ("payments"."clinic_id" = nullif(current_setting('app.clinic_id', true), '')::uuid);