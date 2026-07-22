# 002 — Folder Convention

## Topo de `src/`

| Pasta | Responsabilidade |
|-------|------------------|
| `app/` | Rotas e layouts (App Router) |
| `modules/` | Domínios / features |
| `shared/` | Infra compartilhada entre features (ver abaixo) |
| `core/` | Plataforma (auth session, logger, email, cache, permissions, events, etc.) — banco fica em `db/` |
| `components/` | UI base / design system (shadcn) |
| `lib/` | Helpers de bibliotecas (`cn`, etc.) |
| `db/` | Schema Drizzle, migrations, client |
| `providers/` | Providers React da aplicação |
| `hooks/` | Hooks globais de app (não de domínio) |
| `config/` | env, routes, permissions, sidebar, theme |
| `styles/` | Estilos globais adicionais |
| `types/` | Tipos transversais da aplicação |
| `utils/` | Utilitários transversais (`date`, `money`, `cpf`…) |
| `constants/` | Constantes transversais |
| `services/` | Serviços cross-cutting (domínio fica no módulo) |
| `stores/` | Zustand — apenas estado de cliente global |
| `proxy.ts` | Proxy Next.js 16 (ex-middleware) — auth/rotas |

## `shared/` — o que pode existir

Apenas infra reutilizável entre módulos, **sem espelhar** pastas do topo:

| Pasta | Responsabilidade |
|-------|------------------|
| `api/` | ApiClient, interceptors, error handler HTTP |
| `auth/` | Helpers de autenticação compartilhados (não o módulo `authentication`) |
| `errors/` | Erros tipados de domínio / aplicação |
| `validators/` | Validadores genéricos reutilizados por vários módulos |

**Não criar** em `shared/`: `components`, `hooks`, `providers`, `types`, `utils`, `constants` — esses vivem no topo de `src/`.

## Onde colocar o quê

| Precisa de… | Coloque em |
|-------------|------------|
| UI de domínio (`PatientCard`) | `modules/<feature>/components` |
| Button, Input, Dialog | `components/` |
| `usePatients` | `modules/patients/hooks` |
| Hook de app (ex.: media query) | `hooks/` |
| Provider do layout | `providers/` |
| Tipo `PaginatedResult` | `types/` |
| `formatCpf` | `utils/` |
| ApiClient | `shared/api/` |
| `AppError` | `shared/errors/` |
| Logger | `core/logger/` |
| Email (facade + provider) | `core/email/` — trocar provedor só em `core/email/index.ts` |
| Schema Drizzle | `db/` |

## Nomenclatura

- Arquivos de domínio: `kebab-case` (`create-patient.ts`, `patient.service.ts`)
- Componentes React: `PascalCase` (`PatientCard.tsx`)
- Pastas: `kebab-case`

## Alias

Use `@/` (mapeado para `src/`). Evite imports relativos profundos (`../../../../`).
