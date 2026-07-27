# Plan downgrade over_limit

- Date: 2026-07-27
- Tags: billing, entitlements, plan-limits

## What

Downgrade livre + modo `over_limit` (ADR-004): dados permanecem; banner no shell; creates bloqueados via `assertPlanCapacity`.

## API

- `billingService.getClinicPlanQuota(clinicId)`
- `billingService.assertPlanCapacity(clinicId, dimension)` — `users` | `professionals` | `storage`
- Banner: `PlanOverLimitBanner` em `AppShell` + `AttendanceShell`
- Action/hook: `getClinicPlanQuotaAction` / `useClinicPlanQuota`
- Página owner: `/settings/usage` (`ClinicPlanUsagePanel` + `OwnerProvider`)
- Medidor genérico: `UsageMeter` (`src/components/ui/usage-meter.tsx` + Storybook)

## Call sites (MVP)

- `invitation.service` → `users`
- professional create/invite → `professionals`
- upload (futuro) → `storage`

Não colocar no `requireClinic`.
