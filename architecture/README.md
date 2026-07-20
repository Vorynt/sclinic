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

## Fluxo de camadas

```
Page → Server Action → Service → Repository → Database (Drizzle)
```

## Estado

- **Server state** → TanStack Query (`queries/` / `mutations/` do módulo)
- **Client state** → Zustand em `src/stores/` (Auth, Theme, Sidebar, Preferences, Notification)
- **Dados de domínio** → nunca no Zustand

## `shared/` vs topo de `src/`

- **`shared/`** → só `api/`, `auth/`, `errors/`, `validators/`
- **Topo** → design system, providers, hooks de app, types, utils, constants
- Sem pastas espelhadas entre os dois (ver [002](./002-folder-convention.md))
