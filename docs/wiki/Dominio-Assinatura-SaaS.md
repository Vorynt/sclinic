# Domínio — Assinatura SaaS

**Módulo:** `billing` (subscriptions/plans) · **Épico:** E2 · **ADRs 003, 004**

## Modelo

- Assinatura por **`userId`** (owner), não por clinic
- Unique viva: `trialing` | `active` | `past_due`
- Clínica espelha `subscriptionStatus`
- Membro convidado usa entitlement do owner da clínica
- Checkout (primeira compra) + Customer Portal (gestão / regularização); webhook sincroniza

## Planos (seed)

Essencial (3u/2p), Profissional (10/8), Enterprise (50/40) — validar no seed do ambiente.

## Entitlement vs over_limit

| Conceito | Efeito |
|----------|--------|
| Sem entitlement (`unpaid` / `canceled` / `incomplete` / `none`) | Limpa clínica ativa → `/select-clinic` |
| `past_due` (grace) | **Mantém** acesso ao produto + alerta Portal |
| Over limit | Banner; bloqueia creates (users/professionals); **não** derruba sessão |

Metering `users`: memberships com `status=active` e `deletedAt` nulo. Suspensos não ocupam vaga; soft-remove (`removed` + `deletedAt`) também libera.

## Zonas de acesso (ADR-003 amend)

| Zona | Gate | Uso |
|------|------|-----|
| Produto | `requireClinic` | Dashboard / módulos |
| Billing self-service | Owner autenticado mesmo sem entitlement | `/account/subscription` |
| Tenant teardown | `requireOwnedClinicTeardown` | Excluir clínica (cancela Stripe na hora) |

## Regularização

1. Owner bloqueado → CTA em `/select-clinic` → `/account/subscription`
2. Com `gatewayCustomerId` → Stripe Billing Portal
3. Sem customer → Checkout (após escolher plano); cancela sub órfã no Stripe antes

## Troca de plano (Customer Portal)

1. Owner abre Portal em `/account/subscription` → altera o price da assinatura
2. Stripe dispara `customer.subscription.updated`
3. Sync resolve o `planId` **pelo `price.id` atual** (`plans.stripe_price_id`), não pelo `metadata.planId` do checkout (que fica congelado)
4. Upsert local atualiza plano, status, período e cotas; metadata Stripe `planId` é realinhado quando diverge
5. Retorno com `?portal=1` + poll: se o plano mudou, alert **"Plano atualizado"** em `/account/subscription`

Pré-requisito: prices do Portal precisam existir em `plans.stripe_price_id` (`npm run stripe:sync-plans` / webhooks de product/price).

## Exclusão de clínica

- Disponível no danger zone (assinatura viva) e em `/select-clinic` (assinatura bloqueada)
- Cancela Stripe imediatamente (MVP 1:1) + soft-delete do tenant

## UI

`/onboarding/plan`, `/account/subscription` (alert de plano atualizado pós-Portal), `/settings/usage` (owner), `PlanOverLimitBanner`, select-clinic (regularizar / excluir).

## Decisões

Portal-first (sem lista de faturas no app). Downgrade livre sem apagar dados. MVP 1:1 assinatura↔clínica owned. Ver [ADR-003](../adr/003-user-saas-subscription.md).
