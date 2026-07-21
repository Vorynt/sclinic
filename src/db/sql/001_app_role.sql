-- Application role that MUST obey RLS (no BYPASSRLS).
-- Run once on Neon (SQL Editor) as a privileged role before using sclinic_app.
--
-- Then point DATABASE_URL (runtime) at a user that is member of sclinic_app,
-- or SET ROLE sclinic_app at the start of each session.
-- Keep a separate privileged URL for migrations (drizzle-kit).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sclinic_app') THEN
    CREATE ROLE sclinic_app NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO sclinic_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sclinic_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sclinic_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sclinic_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO sclinic_app;
