# ADR-013: Jest como runner de testes (unit, API, interface)

- **Date**: 2026-08-14
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, testing, jest

## Context and Problem Statement

Os testes de domínio usam `node:test` + `node:assert` (`tsx`). Isso cobre unitários simples, mas não escala para Server Actions com mocks, Testing Library (jsdom) nem cobertura padronizada. Precisamos de um runner único para unit, API (actions) e interface, sem migrar os 31 arquivos existentes de uma vez.

## Decision Drivers

- Espelhar o fluxo Action → Service → Repository nos tipos de teste
- Integração oficial com Next.js 16 (`next/jest` + SWC)
- Convivência com `node:test` até a migração por módulo
- Não inventar pasta paralela de testes (continuar em `modules/<feature>/tests/`)

## Considered Options

- Manter só `node:test`
- Vitest (já há Vite no Storybook)
- **Jest via `next/jest`** (escolhida)

## Decision Outcome

Chosen option: **Jest com `next/jest`**, ambiente default `node`, jsdom só em `*.ui.spec.tsx`.

Na transição: `*.test.ts` continuou no `node:test`; Jest coleta `*.spec.ts(x)`. Specs importam de `@jest/globals`.

**Amend 2026-08-14:** a migração dos 31 arquivos concluiu. `npm run test` é só Jest; `node:test` foi removido.

E2E permanece fase posterior (Playwright), fora do Jest. Jest não cobre Server Components async (limitação documentada pelo Next.js).

Vitest foi considerado (ESM nativo, Vite já no Storybook) e descartado: o time optou por Jest e o Next documenta `next/jest` + Testing Library.

### Positive Consequences

- Um runner para unit / API (actions) / interface
- Alias `@/`, CSS/font mocks e SWC via `next/jest`
- Migração gradual sem quebrar `npm run test`

### Negative Consequences

- Jest é mais pesado que `node:test` para unitários puros
- Server Components async ficam para E2E
- `better-auth` (ESM) exige stub em `__mocks__/better-auth.ts`

## Links

- [architecture/009-testing.md](../../architecture/009-testing.md)
- [Jest + Next.js](https://nextjs.org/docs/app/guides/testing/jest)
