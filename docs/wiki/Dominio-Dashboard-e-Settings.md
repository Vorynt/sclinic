# Domínio — Dashboard e Settings

**Módulos:** `dashboard`, `settings` · **Épico:** E8 (+ E7 no board)

## Dashboard

- `AppShell`, sidebar (`nav.ts`), homes por role (`HomeByRole`)
- Homes: Owner, Admin, Manager, Receptionist (+ board), Doctor, Nurse, Financial, Default
- AttendanceShell separado (sem sidebar completa)

## Settings

Shell fino em `/settings/*`; domínio real em clinics / audit / medical-records / billing.

| Rota | Gate extra |
|------|------------|
| general, hours, prescriptions | `settings.manage` |
| usage | owner |
| audit | `audit.read` |
| danger | exclusão clínica |

## Decisão

Settings não vira “god module”: só navegação e composição de UIs de outros domínios.
