# 009 — Testing

## Localização

Testes de domínio em `modules/<feature>/tests/`. Testes de infra compartilhada ficam junto do código em `src/shared/`.

## Runner

Jest via `next/jest` (ADR-013). Config: `jest.config.ts`. Ambiente default: `node`.

Specs importam `describe` / `it` / `expect` de `@jest/globals`.

`better-auth` é ESM e não é transformado pelo Jest: `__mocks__/better-auth.ts` cobre o pacote e subpaths (`jest.config.ts`).

## Nomenclatura

| Arquivo | Ambiente |
|---------|----------|
| `*.unit.spec.ts` | `node` |
| `*.api.spec.ts` | `node` |
| `*.ui.spec.tsx` | `jsdom` (`/** @jest-environment jsdom */` no topo) |

## Pirâmide

- **Unit:** services, validators, schemas, utils, mappers — sem UI e sem DB.
- **API:** Server Actions (e route handlers pontuais) com repositories/services mockados. Não há REST de domínio; “API” = actions.
- **Interface:** componentes client com Testing Library. Não testar detalhes visuais no início; priorizar comportamento.
- **E2E:** fluxos críticos (auth, agendamento, etc.) — fase posterior, fora do Jest (Playwright). Jest não cobre Server Components async.

## Cobertura (gate CI)

Piso anti-regressão em `jest.config.ts` (`coverageThreshold` + `collectCoverageFrom`). `npm run test:coverage` falha abaixo do limite.

| Métrica | Limite |
|---------|--------|
| statements / lines | 80% |
| branches | 60% |
| functions | 55% |

**Entram no denominador:** `schemas/`, `utils/`, `mappers/` dos módulos; `src/shared/errors`; `src/shared/validators`.

**Fora do gate** (Jest unit não cobre ou ainda não há specs):

- `src/app/**` — Server Components async (ADR-013)
- `**/components/**`, `src/components/**` — UI (`*.ui.spec.tsx` / E2E)
- `**/actions/**` — fase API
- `**/repositories/**`, `src/db/**` — Drizzle; mock no teste de service
- `**/hooks/**`, `**/queries/**`, `**/mutations/**`
- `src/core/email/providers/**`, `src/core/stripe/**`, wiring `better-auth`
- `**/constants/**` (FAQ/copy) e `*.spec.ts(x)`
- `**/services/**` — nesta fase. Quando houver unit de service com repo mockado, entram no `collectCoverageFrom` e o piso sobe (40% → 70%).

O gate não substitui a pirâmide: services continuam o alvo de domínio (testáveis sem UI).

## Regras

- Services devem ser testáveis sem UI.
- Repositories mockáveis ou com banco isolado.
- Actions: validar input e delegar; o teste de API mocka a camada de baixo, não o Drizzle.
- Não testar detalhes de implementação de componentes visuais no início; priorizar domínio.
