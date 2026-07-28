# Índice de decisões

Decisões canônicas: **ADRs** em `docs/adr/`. Notas curtas de implementação: `.notebook/`.

## ADRs

| ADR | Título | Status | Impacto |
|-----|--------|--------|---------|
| [001](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/001-clinic-audit-module.md) | Módulo de auditoria | Accepted | `audit` + `core/events` |
| [002](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/002-clinical-billing.md) | Faturamento clínico | Accepted | charges/payments; collect vs view |
| [003](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/003-user-saas-subscription.md) | Assinatura por user | Accepted | Stripe Portal-first; entitlement |
| [004](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/004-plan-downgrade-over-limit.md) | Downgrade over_limit | Accepted | banner + assertPlanCapacity |
| [005](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/005-prescriptions.md) | Receitas médicas | Accepted | draft→issued; print HTML |
| [006](https://github.com/ViniciusSantos31/sclinic/blob/main/docs/adr/006-reception-ops-sse.md) | Recepção + SSE | Accepted | board; médico não cobra |

Paths locais: `docs/adr/00N-*.md`.

## Decisões por feature (resumo)

| Tema | Decisão | Onde aprofundar |
|------|---------|-----------------|
| Audit desacoplado | Events em vez de importar repository | ADR-001, [Auditoria](Dominio-Auditoria) |
| SaaS ≠ clínico | Subdomínios no módulo billing | ADR-002/003 |
| Pagador = user | Não clinicId na subscription | ADR-003 |
| Downgrade | Nunca apagar dados; bloquear creates | ADR-004 |
| Receita | Entidade própria; snapshot na emissão | ADR-005 |
| Caixa | Separado do “concluir” clínico | ADR-006 |
| Realtime MVP | SSE in-process, extensível a broker | ADR-006 |
| Módulo referência | `patients` como template | architecture/001 |

## Notebooks (implementação)

| Note | Assunto |
|------|---------|
| `auth-invite-email-verified` | Invite marca e-mail verificado |
| `clinic-switcher-suspended` | Suspensas disabled no switcher |
| `financial-collect-rbac` | Seed da perm collect |
| `subscription-access-guard` | Gate → select-clinic |
| `plan-downgrade-over-limit` | Banner + capacity |

## Quando criar ADR novo

Mudança de boundary entre módulos, modelo de dados irreversível, trade-off de produto com impacto arquitetural, ou “vamos fazer diferente do architecture/”. Processo sugerido: skill `create-adr` / pasta `docs/adr/`.
