# ADR-002: Faturamento clínico (cobranças da clínica)

- **Date**: 2026-07-24
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, billing, clinical, payments

## Context and Problem Statement

O módulo `billing` já modela planos e assinaturas SaaS (Stripe stub). Precisamos de cobrança por consulta (contas a receber da clínica), sem misturar com a monetização do produto, e com um modelo que depois suporte pagamento no sistema (PIX/gateway, ex.: Asaas).

## Decision Drivers

- Fluxo Action → Service → Repository
- Isolar assinatura SaaS de recebíveis clínicos
- MVP manual (dinheiro/PIX informado/cartão) sem gateway
- Extensível a gateway sem reescrever o domínio
- RLS por `clinicId`
- Permissões: `financial.view` (listagem), `financial.manage` (admin), `financial.collect` (criar/liquidar na agenda — recepção/médico)

## Considered Options

- Novo módulo `receivables` / `clinical-billing`
- Tudo em `billing` misturando `subscriptions` e charges
- Subdomínio clínico em `billing` com tabelas e services separados

## Decision Outcome

Chosen option: **"Subdomínio clínico em `billing`"** — tabelas `charges` / `payments` em `src/db/schema/clinical-billing.ts`, service `charge.service.ts` separado de `billing.service.ts` (SaaS).

- Cobrança: 1 charge ativa por `appointmentId`
- Criação opcional no agendamento (`amountCents`) ou ao concluir o atendimento
- Liquidação (`markPaid` / `cancel`) por quem tem `financial.collect` ou `financial.manage`
- Listagem `/billing` exige `financial.view`
- Gateway futuro: campos `provider` / `providerChargeId` / `providerPayload`; `method: gateway` no payment

### Positive Consequences

- Assinatura Stripe permanece intocada
- Recepção/médico cobram no fluxo operacional sem acesso à lista financeira completa
- Retry/webhook de gateway não exige mudar o ciclo de vida da charge

### Negative Consequences

- Dois “mundos” no mesmo módulo — disciplina de naming (`charge.*` vs `billing.*` SaaS) é obrigatória
- `appointmentId` NOT NULL no MVP; cobrança avulsa exigirá migration futura
- Após alterar a matriz RBAC, rodar `npm run db:seed:rbac` (ou re-seed demo) para clínicas existentes

## Links

- `architecture/001-feature-based.md`
- `src/db/schema/billing.ts` (SaaS)
- `src/db/schema/clinical-billing.ts` (clínico)
- `src/config/permissions.ts`
- Fluxo operacional do balcão: [ADR-006](./006-reception-ops-sse.md)
