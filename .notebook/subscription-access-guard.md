# Subscription access guard

- Date: 2026-07-27
- Tags: billing, auth, entitlement

## What

App access is gated by `clinics.subscriptionStatus` (owner SaaS mirror, ADR-003). Living = `trialing|active|past_due`.

## Flow

1. `auth.service` `buildAuthContextFromParts` — after membership resolve, `billingService.getClinicEntitlement`
2. Not entitled → clear `activeClinicId`, set `subscriptionBlockedClinic`, `needsClinicSelection=true`
3. Layouts → `/select-clinic` with alert; owner CTA → `/onboarding/plan?intent=reactivate`
4. `requireClinic` / `switchClinic` also call `assertClinicEntitled`

## Key paths

- `billing/constants/subscription.ts` — `isClinicEntitledStatus`
- `billing.service` — `getClinicEntitlement` / `assertClinicEntitled`
- `shared/auth/types.ts` — `subscriptionBlockedClinic`
- `SelectClinicBlock` — alert + regularize CTA
