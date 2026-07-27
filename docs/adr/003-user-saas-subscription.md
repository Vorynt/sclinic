# ADR-003: Assinatura SaaS por usuário (Stripe Portal-first)

- **Date**: 2026-07-27
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, billing, saas, stripe, subscriptions

## Context and Problem Statement

A assinatura SaaS estava modelada em `subscriptions.clinicId`, mas um usuário pode ser membro de uma clínica alheia e, ao mesmo tempo, criar a própria. Quem paga é a pessoa (owner), não o tenant operacional. Precisamos de Customer Portal no Stripe para gestão de cartão/faturas/cancelamento, com o app apenas espelhando status e alertas.

## Decision Drivers

- Separar pagador (user) de tenant (clinic) e de recebíveis clínicos (ADR-002)
- Portal-first: sem lista de faturas no app
- MVP 1:1 — uma assinatura viva por user → uma clínica própria
- Clínica default = aquela em que o user é owner
- Fluxo Action → Service → Repository; webhooks idempotentes
- Stripe como única fonte de cobrança recorrente; sync local via webhook

## Considered Options

- Manter assinatura por `clinicId`
- Assinatura por `userId` + entitlement da clínica owned
- Conta “billing account” intermediária entre user e clinic

## Decision Outcome

Chosen option: **Assinatura SaaS por `userId`**, subdomínio em `billing` (serviço `billing.service` / `subscription.*`), UI em `/account/subscription`.

- `subscriptions.userId` (FK `user`); unique de assinatura viva (`trialing` | `active` | `past_due`) por user
- Stripe Customer / Subscription IDs no registro da assinatura
- `clinics.subscriptionStatus` permanece denormalizado e é sincronizado a partir da assinatura do owner
- Member convidado não precisa de assinatura própria; gate da clínica alheia usa a assinatura do owner daquela clínica
- Checkout Session para ativar; Customer Portal para gerenciar; webhooks atualizam o espelho local
- Faturamento clínico (`charges` / `/billing`) permanece intocado (ADR-002)

### Positive Consequences

- Modelo alinha “membro + owner” sem cobrar duas vezes
- UI de assinatura no shell de conta, sem misturar com Settings da clínica
- Stripe Portal reduz superfície de PCI e de UI de billing

### Negative Consequences

- Migration quebra o stub `clinicId` → exige re-seed / migração de dados
- Enforcement e sync owner→clinic precisam disciplina nos webhooks
- 1:N clínicas por assinatura fica para fase futura

## Links

- [ADR-002 — faturamento clínico](./002-clinical-billing.md)
- `src/db/schema/billing.ts`
- `src/modules/billing/`
- `architecture/001-feature-based.md`
