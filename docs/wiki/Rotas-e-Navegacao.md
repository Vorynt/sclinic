# Rotas e navegação

Fonte canônica: `src/config/routes.ts`. Route groups `(auth)`, `(dashboard)` etc. **não** entram na URL.

## Mapa

| Área | Paths principais |
|------|------------------|
| Marketing | `/`, `/legal`, `/termos`, `/privacidade`, `/cookies`, `/contrato-saas`, `/dpa`, `/seguranca`, `/retencao`, `/incidentes`, `/ropa` (soft nav Termos/Privacidade → modal `@modal/(.)…`) |
| Auth | `/login`, `/sign-up`, `/forgot-password`, `/reset-password`, `/two-factor`, `/verify-email`, `/change-password`, `/invite`, `/invite/professional`, `/select-clinic`, `/membership-inactive` |
| Onboarding | `/onboarding/plan`, `/onboarding/clinic`, `/onboarding/hours` |
| App | `/home`, `/patients`, `/patients/[id]/*`, `/professionals`, `/appointments`, `/appointments/new`, `/billing`, `/users`, `/settings/*`, `/help` |
| Attendance | `/appointments/[id]/attendance/*` (`documents`; `/prescriptions` → redirect) |
| Account | `/account/overview`, `profile`, `security`, `subscription` |
| Print | `/prescriptions/[id]/print` |
| API | `/api/auth/[...all]`, `/api/stripe/webhook`, `/api/realtime/clinic` |

## Gates de layout (resumo)

- Dashboard / attendance / account: e-mail verificado, senha ok, membership, entitlement.
- Settings: `settings.manage`; subtítulos `audit.read` / owner-only usage.
- Patient clinical tabs: `records.read`.
- `/help`: FAQ curado por papel (módulo `help`); item Ajuda no overflow da nav, habilitado para todos.

Nav: `src/modules/dashboard/constants/nav.ts` — shell híbrido (top nav + bottom tabs + “Mais”); itens somem sem permissão. Ações de página (`PageAction[]` no `PageHeader`) viram FAB mobile no `AppShell` (`PageActionsFab`).
