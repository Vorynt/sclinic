# Domínio — Assinatura SaaS

**Módulo:** `billing` (subscriptions/plans) · **Épico:** E2 · **ADRs 003, 004**

## Modelo

- Assinatura por **`userId`** (owner), não por clinic
- Unique viva: `trialing` | `active` | `past_due`
- Clínica espelha `subscriptionStatus`
- Membro convidado usa entitlement do owner da clínica
- Checkout + Customer Portal; webhook sincroniza

## Planos (seed)

Essencial (3u/2p), Profissional (10/8), Enterprise (50/40) — validar no seed do ambiente.

## Entitlement vs over_limit

| Conceito | Efeito |
|----------|--------|
| Sem entitlement | Limpa clínica ativa → `/select-clinic` |
| Over limit | Banner; bloqueia creates (users/professionals); **não** derruba sessão |

Metering `users`: memberships com `status=active` e `deletedAt` nulo. Suspensos não ocupam vaga; soft-remove (`removed` + `deletedAt`) também libera.

## UI

`/onboarding/plan`, `/account/subscription`, `/settings/usage` (owner), `PlanOverLimitBanner`.

## Decisões

Portal-first (sem lista de faturas no app). Downgrade livre sem apagar dados. MVP 1:1 assinatura↔clínica owned.
