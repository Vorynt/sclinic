# Clinic switcher — suspended memberships

`authService.listMemberships` → `membershipRepository.listForClinicSwitcher`
returns `active` + `suspended` (with optional `clinicName`).

`ClinicIndicator` disables suspended rows and shows subtitle "Suspenso".
`switchClinic` uses `findByUserAndClinic` and throws `MEMBERSHIP_INACTIVE`
when status ≠ active.

RLS: `clinics_member_access` allows SELECT for suspended members
(migration `0006_colossal_mikhail_rasputin`).

## Suspended-only landing

When `membership` is null and `hasSuspendedMembershipOnly` is true:

- `getPostAuthRedirect` / dashboard / onboarding (sem intent) → `/membership-inactive`
- UI: `MembershipInactiveBlock` + CTA `?intent=create-clinic` → onboarding
- `memberRepository.softRemove` / status toggle → `suspended` (não `removed`)
- Aceitar convite reativa membership `suspended` existente
