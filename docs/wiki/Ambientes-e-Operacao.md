# Ambientes e operação

## Setup local

```bash
npm install
cp .env.example .env.local
npm run db:migrate    # ou db:push
npm run db:seed:rbac
npm run db:seed:plans
# opcional: npm run db:seed:demo
npm run dev
```

Stripe (checkout real em test mode):

```bash
npm run stripe:sync-plans
# webhook → /api/stripe/webhook
```

## Scripts úteis

| Script | Uso |
|--------|-----|
| `npm run test` | Testes de domínio |
| `npm run storybook` | Design system |
| `npm run docs:wiki:sync` | Publica esta wiki no GitHub |
| `npm run db:studio` | Drizzle Studio |

## Variáveis

Ver `.env.example` (DB, Better Auth, Stripe, Resend, etc.).

## Seeds e armadilhas

- Sem `db:seed:rbac`, permissões como `financial.collect` / `audit.read` podem faltar.
- Demo seed pode deixar `subscription_status = none` → guard de entitlement age (esperado).
- SSE in-process: em multi-instância o board pode não sincronizar sem broker (ADR-006).

## Proxy

Next 16 usa `src/proxy.ts` (não `middleware.ts`) para cookies/rotas públicas.
