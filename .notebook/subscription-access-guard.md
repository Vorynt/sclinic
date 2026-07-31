# Subscription access guard

- Date: 2026-07-27 (amended 2026-07-31)
- Tags: billing, auth, entitlement

## What

App access is gated by `clinics.subscriptionStatus` (owner SaaS mirror, ADR-003). Living / entitled = `trialing|active|past_due`.

## Flow

1. `auth.service` `buildAuthContextFromParts` — after membership resolve, `billingService.getClinicEntitlement`
2. Not entitled → clear `activeClinicId`, set `subscriptionBlockedClinic`, `needsClinicSelection=true`
3. Layouts (dashboard/attendance) → `/select-clinic` with status-aware alert
4. Owner CTA → `/account/subscription` (Portal-first regularize); secondary → delete clinic
5. Account layout allows blocked **owner** into AccountShell (billing self-service)
6. `requireClinic` / `switchClinic` also call `assertClinicEntitled`
7. Clinic delete uses `requireOwnedClinicTeardown` (no entitlement) + `cancelSubscriptionForUser`

## Key paths

- `billing/constants/subscription.ts` — `isClinicEntitledStatus`
- `billing.service` — `getClinicEntitlement` / `assertClinicEntitled` / `createRegularizeSession` / `cancelSubscriptionForUser`
- `authentication/permissions/guards.ts` — `requireOwnedClinicTeardown`
- `shared/auth/types.ts` — `subscriptionBlockedClinic`
- `SelectClinicBlock` — alert + regularize + delete
