# Rotas e navegação

Fonte canônica: `src/config/routes.ts`. Route groups `(auth)`, `(dashboard)` etc. **não** entram na URL.

## Mapa

### Marketing

`/` · `/legal` · `/termos` · `/privacidade` · `/cookies` · `/contrato-saas` · `/dpa` · `/seguranca` · `/retencao` · `/incidentes` · `/ropa`

Soft nav Termos/Privacidade → modal `@modal/(.)…`.

### Auth

`/login` · `/sign-up` · `/forgot-password` · `/reset-password` · `/two-factor` · `/verify-email` · `/change-password` · `/invite` · `/invite/professional` · `/select-clinic` · `/membership-inactive`

### Onboarding

`/onboarding/plan` · `/onboarding/clinic` · `/onboarding/hours`

### App

`/home` · `/patients` · `/patients/[id]/*` · `/professionals` · `/services` · `/appointments` · `/appointments/new` · `/billing` · `/users` · `/settings/*` · `/help`

### Attendance

`/appointments/[id]/attendance` (landing = notas). `/notes`, `/vitals`, `/documents`, `/prescriptions` → redirect (`?panel=` + `mode`/`date`)

### Account

`/account/overview` · `clinics` · `profile` · `security` · `subscription`

### Print

`/prescriptions/[id]/print`

### API

`/api/auth/[...all]` · `/api/stripe/webhook` · `/api/realtime/clinic`

## Gates de layout (resumo)

- Proxy: cookie ausente → `/login?next=…`; cookie presente não tira o usuário de auth entry. Login / sign-up / forgot-password / two-factor: se a sessão for real, `getPostAuthRedirect`.
- Dashboard / attendance / account: e-mail verificado, senha ok, membership, entitlement.
- Attendance workspace: `records.read` e `appointments.create|update`.
- Settings: `settings.manage`; subtítulos `audit.read` / owner-only usage.
- `/services`: `financial.view` (CRUD com `financial.manage`). `/settings/services` redireciona para `/services`.
- Patient clinical tabs: `records.read`.
- `/help`: FAQ curado por papel (módulo `help`); item Ajuda no overflow da nav, habilitado para todos.

Nav: `src/modules/dashboard/constants/nav.ts` — shell híbrido (top nav + bottom tabs + “Mais”); itens somem sem permissão. Ações de página (`PageAction[]` no `PageHeader`) viram FAB mobile no `AppShell` (`PageActionsFab`).

## Ver também

- [Autenticação](Dominio-Autenticacao)
- [Dashboard e settings](Dominio-Dashboard-e-Settings)
- [RBAC e permissões](RBAC-e-Permissoes)
