CREATE INDEX "clinic_memberships_clinic_status_alive_idx" ON "clinic_memberships" USING btree ("clinic_id","status") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "professional_clinics_clinic_status_alive_idx" ON "professional_clinics" USING btree ("clinic_id","status") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "appointments_clinic_range_alive_idx" ON "appointments" USING btree ("clinic_id","starts_at","ends_at") WHERE "deleted_at" IS NULL;
