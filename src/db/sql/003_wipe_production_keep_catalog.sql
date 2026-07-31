-- =============================================================================
-- PRODUÇÃO: zera dados operacionais, preserva catálogo SaaS + RBAC
-- =============================================================================
--
-- PRESERVA
--   plans
--   roles                  (apenas system roles: clinic_id IS NULL)
--   permissions
--   role_permissions       (matriz do catálogo; necessária para os roles)
--
-- REMOVE
--   usuários, sessões, clínicas, memberships, convidados, profissionais,
--   pacientes, agenda, prontuário, cobrança clínica, assinaturas SaaS,
--   webhooks Stripe, auditoria, roles customizados por clínica, etc.
--
-- COMO RODAR (Neon SQL Editor / psql com owner — bypassa RLS)
--   1. Backup / branch do Neon antes.
--   2. Remova o bloco de safety guard abaixo (ou ajuste a confirmação).
--   3. Execute o script inteiro numa única sessão.
--   4. Confira os counts finais.
--
-- NÃO rode com a role sclinic_app (RLS pode bloquear deletes).
-- =============================================================================

BEGIN;

-- Safety guard: exige confirmação explícita nesta sessão.
-- Remova estas 6 linhas se preferir rodar sem o guard.
DO $$
BEGIN
  IF current_setting('app.confirm_wipe', true) IS DISTINCT FROM 'YES_WIPE_PRODUCTION' THEN
    RAISE EXCEPTION
      'Abortado. Antes de executar, rode: SET LOCAL app.confirm_wipe = ''YES_WIPE_PRODUCTION'';';
  END IF;
END
$$;

-- Snapshot pré-wipe (aparece no output do client)
SELECT 'before' AS phase,
  (SELECT count(*) FROM plans) AS plans,
  (SELECT count(*) FROM roles) AS roles,
  (SELECT count(*) FROM roles WHERE clinic_id IS NULL) AS system_roles,
  (SELECT count(*) FROM permissions) AS permissions,
  (SELECT count(*) FROM role_permissions) AS role_permissions,
  (SELECT count(*) FROM clinics) AS clinics,
  (SELECT count(*) FROM "user") AS users;

-- Roles customizados por clínica (dados de tenant) saem com o wipe.
-- System roles (clinic_id IS NULL) permanecem.
DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE clinic_id IS NOT NULL);

DELETE FROM roles
WHERE clinic_id IS NOT NULL;

-- roles.clinic_id → clinics impede TRUNCATE de clinics sem incluir roles.
-- Soltamos a FK só durante o wipe; system roles têm clinic_id NULL.
ALTER TABLE roles DROP CONSTRAINT roles_clinic_id_clinics_id_fk;

TRUNCATE TABLE
  audit_logs,
  payments,
  charges,
  prescriptions,
  prescription_layouts,
  vital_signs,
  patient_clinical_alerts,
  clinical_notes,
  appointments,
  patients,
  professional_clinics,
  professionals,
  invitations,
  clinic_memberships,
  clinic_business_hours,
  subscriptions,
  stripe_webhook_events,
  clinics,
  session,
  account,
  verification,
  "user"
RESTART IDENTITY CASCADE;

ALTER TABLE roles
  ADD CONSTRAINT roles_clinic_id_clinics_id_fk
  FOREIGN KEY (clinic_id) REFERENCES clinics (id)
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

-- Snapshot pós-wipe
SELECT 'after' AS phase,
  (SELECT count(*) FROM plans) AS plans,
  (SELECT count(*) FROM roles) AS roles,
  (SELECT count(*) FROM roles WHERE clinic_id IS NULL) AS system_roles,
  (SELECT count(*) FROM permissions) AS permissions,
  (SELECT count(*) FROM role_permissions) AS role_permissions,
  (SELECT count(*) FROM clinics) AS clinics,
  (SELECT count(*) FROM "user") AS users;

-- Sanity: catálogo não pode ter ficado vazio
DO $$
BEGIN
  IF (SELECT count(*) FROM plans) = 0 THEN
    RAISE EXCEPTION 'Wipe concluiu sem plans — abortando (ROLLBACK). Re-seed necessário?';
  END IF;
  IF (SELECT count(*) FROM roles WHERE clinic_id IS NULL AND is_system = true) = 0 THEN
    RAISE EXCEPTION 'Wipe concluiu sem system roles — abortando (ROLLBACK).';
  END IF;
  IF (SELECT count(*) FROM permissions) = 0 THEN
    RAISE EXCEPTION 'Wipe concluiu sem permissions — abortando (ROLLBACK).';
  END IF;
  IF (SELECT count(*) FROM role_permissions) = 0 THEN
    RAISE EXCEPTION 'Wipe concluiu sem role_permissions — abortando (ROLLBACK).';
  END IF;
  IF (SELECT count(*) FROM clinics) <> 0
     OR (SELECT count(*) FROM "user") <> 0 THEN
    RAISE EXCEPTION 'Ainda há clinics/users após o wipe — abortando (ROLLBACK).';
  END IF;
END
$$;

COMMIT;

-- Opcional pós-wipe (fora desta transação), se o catálogo estiver incompleto:
--   npm run db:seed:rbac
--   npm run db:seed:plans
--   npm run stripe:sync-plans
