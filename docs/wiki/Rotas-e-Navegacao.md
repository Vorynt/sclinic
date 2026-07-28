# Rotas e navegação

Fonte canônica: `src/config/routes.ts`. Route groups `(auth)`, `(dashboard)` etc. **não** entram na URL.

## Mapa

| Área | Paths principais |
|------|------------------|
| Marketing | `/` |
| Auth | `/login`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/change-password`, `/invite`, `/invite/professional`, `/select-clinic`, `/membership-inactive` |
| Onboarding | `/onboarding/plan`, `/onboarding/clinic`, `/onboarding/hours` |
| App | `/home`, `/patients`, `/patients/[id]/*`, `/professionals`, `/appointments`, `/billing`, `/users`, `/settings/*`, `/help` |
| Attendance | `/appointments/[id]/attendance/*` |
| Account | `/account/overview`, `profile`, `security`, `subscription` |
| Print | `/prescriptions/[id]/print` |
| API | `/api/auth/[...all]`, `/api/stripe/webhook`, `/api/realtime/clinic` |

## Gates de layout (resumo)

- Dashboard / attendance / account: e-mail verificado, senha ok, membership, entitlement.
- Settings: `settings.manage`; subtítulos `audit.read` / owner-only usage.
- Patient clinical tabs: `records.read`.
- `/help`: FAQ curado por papel (módulo `help`); item Ajuda na sidebar habilitado para todos.

Nav: `src/modules/dashboard/constants/nav.ts` (itens somem sem permissão).
