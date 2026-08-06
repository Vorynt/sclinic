# Arquitetura

Documentação humana. Regras normativas: pasta `architecture/` + `AGENTS.md`.

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js 16 (App Router), React 19 |
| Dados | Drizzle ORM, Neon Postgres |
| Auth | Better Auth |
| Server state | TanStack Query |
| Client state | Zustand (nunca domínio) |
| Pagamentos SaaS | Stripe (Checkout + Portal + webhooks) |
| UI | Tailwind v4, shadcn, tokens tintados (`config/theme.ts` + `globals.css`), `PageHeader` compartilhado |
| Realtime | SSE (`/api/realtime/clinic`) |

## Fluxo de camadas (obrigatório)

```
Page / Component
  → Server Action   (valida input, delega)
    → Service       (regra de negócio)
      → Repository  (único que fala com Drizzle)
        → Database
```

Anti-padrões: Page→DB, lógica pesada em action, SQL fora de repository, `fetch` solto (usar `shared/api`).

## Organização de pastas

```
src/
  modules/<feature>/   # domínio
  app/                 # rotas
  db/                  # schema, migrations, seeds
  core/                # session, events, realtime, …
  shared/              # api, errors, validators, auth
  components/          # UI genérica (design system)
  stores/              # Zustand
```

Módulos canônicos: `patients`, `professionals`, `appointments`, `medical-records`, `billing`, `inventory` (vazio), `dashboard`, `settings`, `users`, `authentication`, `clinics`, `audit`, `marketing`, `help`.

## Estado

| Tipo | Onde |
|------|------|
| Server state | `queries/` + `mutations/` + hooks do módulo |
| Client state | `src/stores/` (auth UI, theme, sidebar…) |
| Realtime ops | SSE + `core/realtime` |

## Validação e erros

- Zod no `schemas/` do módulo; RHF + `zodResolver` no client; `parseOrThrow` na action.
- Erros tipados (`shared/errors`); mutations com `MutationCallbacks`.

## Multi-tenancy

- Todo dado clínico/ops escopado por `clinicId`.
- Entitlement SaaS vem da assinatura do **owner** da clínica (ADR-003).
- Membership `suspended` ≠ clínica sem assinatura.

## Referências

- `architecture/README.md`
- [Módulos e boundaries](Modulos-e-Boundaries)
- [Diagramas](Diagramas)
- [Índice de decisões](Indice-de-Decisoes)
