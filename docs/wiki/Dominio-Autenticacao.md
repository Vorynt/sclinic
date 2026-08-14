# Domínio — Autenticação

**Módulo:** `src/modules/authentication/` · **Épico:** E1

## Sumário

- [Responsabilidade](#responsabilidade)
- [Fluxos](#fluxos)
- [Regras](#regras)
- [Schema](#schema)
- [Decisões relacionadas](#decisões-relacionadas)
- [Arquivos-chave](#arquivos-chave)

## Responsabilidade

Sessão (Better Auth), redirects pós-login, guards de permissão/clínica, utilitários de auth.

## Fluxos

### Login e sessão

- Login (remember-me), sign-up, forgot/reset password
- Remember-me no login (`rememberMe`; default ligado — cookie persistente 7 dias; desligado = cookie de sessão)
- Gestão de sessões em `/account/security`: listar dispositivos, revogar uma (nunca a atual) ou todas as outras
- Verify email; change-password (senha provisória); em `/account/security` a troca de senha é por modal e pode encerrar as outras sessões
- Sign-up exige aceite obrigatório dos Termos de Uso e da Política de Privacidade (`acceptTerms` no `signUpSchema`; campo não é enviado ao Better Auth). Links abrem modal via intercepting routes (`@modal/(.)termos` / `(.)privacidade`)

### 2FA

- 2FA opcional (TOTP + códigos de backup) via plugin Better Auth; desafio em `/two-factor` após senha quando `twoFactorEnabled`
- Modal pós-login incentivando 2FA quando ainda desligado (flag Zustand; some em “Continuar desprotegido” nesta sessão)

### Redirects

- Ordem canônica de redirect: `post-auth-redirect.ts` (ver [Diagramas](Diagramas))
- Invite paths podem preceder verify-email (token prova ownership)

### Multi-clínica e cache

- Pós-login com membership: `useSignInMutation` faz seed do cache da sessão (`setQueryData`) + `SessionBootstrapOverlay` (`LoadingScreen`) até o `AppShell` confirmar auth/permissions no client — evita nav vazia no primeiro paint
- Troca de clínica (`useSwitchClinicMutation`): atualiza o scope do hash (`setQueryClinicId`), `queryClient.clear()` + reseed da session — sem `invalidateQueries()` global (evita storm de refetch da sessão já seedada e de orphans da clínica anterior). Queries montadas fazem cold fetch no novo scope; `ClinicIndicator` ainda chama `router.refresh()` para RSC/permissions
- Layouts RSC (root + segmentos autenticados) usam `getCachedSession` (`React.cache`) — um `getSession` por request HTTP, compartilhado entre root e layout de segmento

## Regras

### Proxy e redirects

- Proxy/cookie **one-way** (`src/proxy.ts` + `utils/route-access.ts`): cookie ausente + path privado → `/login?next=…`. Cookie presente **não** bounceia auth entry (`/login`, `/sign-up`, `/forgot-password`, `/two-factor`, `/reset-password*`) — isso ciclava TOO_MANY_REDIRECTS quando o cookie estava stale (sessão inexistente no banco). Classificação de path: `isPublicPath` / `isAuthEntryPath`
- Páginas guest validam sessão real via `getCachedSession` + `getPostAuthRedirect`. Cookie stale: o layout autenticado manda a `/login` e o form aparece (sem ciclo). Sessão válida em `/login` (etc.) segue o redirect canônico. Desafio 2FA pendente continua com `getSession() === null`
- `getSafeNextPath` recusa auth entry (`/login?next=/login` não cicla)
- Paths públicos incluem hub `/legal` e docs (`/termos`, `/privacidade`, `/cookies`, `/contrato-saas`, `/dpa`, `/seguranca`, `/retencao`, `/incidentes`, `/ropa`)

### Multi-clínica

- `requireClinic` / `assertClinicEntitled` bloqueiam clínica sem assinatura viva (produto)
- `requireOwnedClinicTeardown` — exclusão de clínica owned **sem** exigir entitlement
- Conta (`/account`): owner com assinatura bloqueada acessa self-service de billing

### Permissões e 2FA

- Permissões resolvidas por membership + seed RBAC
- 2FA não é obrigatório; enrollment (QR + backup + TOTP) e desativação em modal, com senha; backup codes só aparecem uma vez (enable/regenerate)
- Cookie cache de sessão desligado — revogação em outro dispositivo vale na hora

## Schema

- `user.two_factor_enabled`
- Tabela `twoFactor` (secret, backup codes, lockout)
- `session` já tem `ip_address` / `user_agent` para a lista de dispositivos

## Decisões relacionadas

Notebook `auth-invite-email-verified`, `subscription-access-guard`.

## Arquivos-chave

- `permissions/guards.ts`
- `utils/post-auth-redirect.ts`
- `utils/route-access.ts`
- `utils/get-cached-session.ts`
- `queries/auth.query.ts`
- `hooks/use-auth.ts` (seed de sessão no sign-in / clear+reseed no switch de clínica)
- `SessionBootstrapOverlay`
- `stores/auth.store.ts` (`isBootstrappingSession`, `pendingTwoFactorNudge`)
- `TwoFactorNudgeDialog`
- `/two-factor`

## Ver também

- [Diagramas](Diagramas)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Clínicas](Dominio-Clinicas)
- [Assinatura SaaS](Dominio-Assinatura-SaaS)
- [Índice de decisões](Indice-de-Decisoes)
