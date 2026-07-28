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
| `npm run db:generate` | Gera SQL em `src/db/migrations/` a partir do schema |
| `npm run db:migrate` | Aplica migrations pendentes na `DATABASE_URL` atual |
| `npm run build:vercel` | Simula o build da Vercel (migrate + `next build`) |

## Variáveis

Ver `.env.example` (DB, Better Auth, Stripe, Resend, etc.).

## Migrations no deploy (Vercel)

Não sincronizamos o banco de **dev** com o de **prod**. O que viaja no Git são os arquivos SQL em `src/db/migrations/`. Cada ambiente aplica o que ainda falta na **sua** `DATABASE_URL`.

### Fluxo mental

```text
schema TS (src/db/schema/)
  → npm run db:generate   (local, commitado)
  → push / merge na branch de produção
  → Vercel Production build
       1. npm run db:migrate   (Neon prod)
       2. next build
```

Config no repo:

| Arquivo | Papel |
|---------|--------|
| `vercel.json` | `buildCommand` → `bash scripts/vercel-build.sh` |
| `scripts/vercel-build.sh` | Migrate **só** se `VERCEL_ENV=production`, depois `next build` |

Preview deploys **não** rodam migrate (evita SQL de feature branch no banco compartilhado).

### Checklist na Vercel (uma vez)

1. Project → **Settings** → **Environment Variables**.
2. `DATABASE_URL` com a connection string do **Neon de produção**, marcada só em **Production**.
3. (Opcional) outra `DATABASE_URL` de **dev/preview** só em **Preview** — usada em runtime, não no migrate do build.
4. Confirme que o Build Command do dashboard está **vazio** ou igual ao do `vercel.json` (settings do dashboard sobrescrevem o arquivo).

### No dia a dia

1. Altere `src/db/schema/`.
2. `npm run db:generate` → revise o SQL → commit no PR.
3. Em local/dev: `npm run db:migrate` com a URL de dev.
4. Ao mergear na branch de produção, o build da Vercel aplica o pendente em prod automaticamente.

Se o build falhar em `[vercel-build] ERROR: DATABASE_URL is not set`, a env de Production não está configurada.

## Seeds e armadilhas

- Sem `db:seed:rbac`, permissões como `financial.collect` / `audit.read` podem faltar.
- Demo seed pode deixar `subscription_status = none` → guard de entitlement age (esperado).
- SSE in-process: em multi-instância o board pode não sincronizar sem broker (ADR-006).
- Nunca use `db:push` em produção; só migrations versionadas.
- Seeds (`db:seed:*`) **não** rodam no deploy — só migrations de schema.

## Proxy

Next 16 usa `src/proxy.ts` (não `middleware.ts`) para cookies/rotas públicas.
