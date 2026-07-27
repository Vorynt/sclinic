# ADR-004: Downgrade de plano e modo `over_limit`

- **Date**: 2026-07-27
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, billing, saas, entitlements, plan-limits

## Context and Problem Statement

Planos SaaS diferem por limites quantitativos (`maxUsers`, `maxProfessionals`, `maxStorageBytes`). No downgrade (ex.: Enterprise → Essencial), o uso atual pode exceder o novo teto. Precisamos definir o que fazer com o excesso antes do lançamento: apagar, desativar, restringir e/ou informar — sem destruir dado clínico nem espalhar checks por todo o app.

## Decision Drivers

- Nunca apagar pacientes, prontuários, membros ou arquivos por causa de downgrade
- Permitir downgrade no Stripe Portal (fluidez comercial)
- Operação da clínica continua (leitura/edição); só bloqueia o que **aumenta** uso
- Banner visível a todos; CTAs de billing só para o owner
- Enforcement centralizado: poucos call sites de create, não middleware global de write
- Alinhar com ADR-003 (assinatura por `userId`, entitlement da clínica owned)

## Considered Options

- Bloquear o downgrade até o uso caber no plano alvo
- Apagar / soft-delete automático do excesso no webhook
- Downgrade livre + modo `over_limit` (banner + bloqueio de creates)
- Desativar recursos excedentes (membros/profissionais ficam inacessíveis)

## Decision Outcome

Chosen option: **Downgrade livre + modo `over_limit`**.

### Política

1. **Dados existentes permanecem** — nada é apagado ou ocultado por downgrade.
2. **`isOverLimit`** — `usage > limit` em qualquer dimensão do plano atual da clínica (via assinatura viva do owner).
3. **Banner persistente** — em todo shell autenticado da clínica (`AppShell`, `AttendanceShell`); todos veem o alerta.
4. **CTAs** — só o owner: “Atualizar plano” → `/account/subscription` e atalho para reduzir o recurso estourado (equipe / profissionais). Membros veem texto pedindo ao administrador.
5. **Bloqueio de criação** — `billingService.assertPlanCapacity(clinicId, dimension)` nos services que **aumentam** uso (`users` | `professionals` | `storage`). `usage >= limit` → `PLAN_LIMIT_EXCEEDED`.
6. **Fora do `requireClinic`** — entitlement de assinatura (ADR-003) continua separado; `over_limit` não derruba a sessão nem bloqueia reads.

### Superfície de enforcement (MVP)

| Dimensão | Call site |
|----------|-----------|
| `users` | `invitation.service` (convidar membro) |
| `professionals` | create/invite de profissional |
| `storage` | upload (quando existir; até lá usage = 0) |

UI pode desabilitar botões lendo a mesma quota; a fonte da verdade é o assert no service.

### API de domínio

- `getClinicPlanQuota(clinicId)` → limits, usage, `over`, `atCapacity`, `isOverLimit`
- `assertPlanCapacity(clinicId, dimension)` → void ou `AppError(PLAN_LIMIT_EXCEEDED)`

### Positive Consequences

- Downgrade previsível e seguro para dado clínico
- Poucos pontos de enforcement; fácil de testar
- Comunicação clara owner vs membro

### Negative Consequences

- Clínica pode operar “acima do plano” até regularizar (trade-off aceito)
- Contagens de usage precisam de queries de metering (memberships / affiliations)
- Pending invites vs seats ativos pode exigir refinamento futuro

## Links

- [ADR-003 — assinatura SaaS por usuário](./003-user-saas-subscription.md)
- `src/modules/billing/services/billing.service.ts` — `getClinicPlanQuota` / `assertPlanCapacity`
- `src/modules/billing/utils/plan-quota.ts`
- `src/modules/billing/components/PlanOverLimitBanner.tsx`
- `src/modules/billing/components/ClinicPlanUsagePanel.tsx` — página `/settings/usage` (owner)
- `src/components/ui/usage-meter.tsx` — medidor genérico (Storybook)
