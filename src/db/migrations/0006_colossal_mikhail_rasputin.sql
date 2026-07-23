ALTER POLICY "clinics_member_access" ON "clinics" TO sclinic_app USING ((
    "clinics"."id" = nullif(current_setting('app.clinic_id', true), '')::uuid
    OR EXISTS (
      SELECT 1
      FROM clinic_memberships m
      WHERE m.clinic_id = "clinics"."id"
        AND m.user_id = nullif(current_setting('app.user_id', true), '')
        AND m.deleted_at IS NULL
        AND m.status IN ('active', 'suspended')
    )
  ));