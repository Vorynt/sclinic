# Governança de arquitetura — sclinic

Documentos obrigatórios do projeto. Cada arquivo define uma regra que o código deve seguir.

| # | Documento | Tema |
|---|-----------|------|
| 001 | [feature-based](./001-feature-based.md) | Módulos por domínio |
| 002 | [folder-convention](./002-folder-convention.md) | Pastas e nomenclatura |
| 003 | [import-rules](./003-import-rules.md) | Imports e boundaries |
| 004 | [server-actions](./004-server-actions.md) | Actions e fluxo em camadas |
| 005 | [services](./005-services.md) | Regras de negócio |
| 006 | [repositories](./006-repositories.md) | Acesso a dados |
| 007 | [api-pattern](./007-api-pattern.md) | ApiClient + React Query |
| 008 | [error-handling](./008-error-handling.md) | Erros |
| 009 | [testing](./009-testing.md) | Testes |
| 010 | [design-system](./010-design-system.md) | UI / Storybook |
| 011 | [form-validation](./011-form-validation.md) | Zod + React Hook Form |
| 012 | [list-query](./012-list-query.md) | Paginação + busca server-side em tabelas |

Ver também:

- [Handbook do sistema (wiki)](../docs/wiki/README.md) — produto, arquitetura, módulos, roadmap, épicos, decisões
- [ADR-001 — módulo de auditoria](../docs/adr/001-clinic-audit-module.md)
- [ADR-002 — faturamento clínico](../docs/adr/002-clinical-billing.md)
- [ADR-003 — assinatura SaaS por usuário](../docs/adr/003-user-saas-subscription.md)
- [ADR-004 — downgrade e modo over_limit](../docs/adr/004-plan-downgrade-over-limit.md)
- [ADR-005 — receitas médicas (prescrição)](../docs/adr/005-prescriptions.md)
- [ADR-006 — fluxo operacional da recepção + SSE](../docs/adr/006-reception-ops-sse.md)

## Fluxo de camadas

```
Page → Server Action → Service → Repository → Database (Drizzle)
```

## Estado

- **Server state** → TanStack Query (`queries/` / `mutations/` do módulo)
- **Client state** → Zustand em `src/stores/` (Auth, Theme, Sidebar, Preferences, Notification)
- **Dados de domínio** → nunca no Zustand
- **Realtime operacional** → SSE (`/api/realtime/clinic`) + `core/realtime` (ADR-006)

## `shared/` vs topo de `src/`

- **`shared/`** → só `api/`, `auth/`, `errors/`, `validators/`
- **Topo** → design system, providers, hooks de app, types, utils, constants
- Sem pastas espelhadas entre os dois (ver [002](./002-folder-convention.md))
