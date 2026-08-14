# Domínio — Autenticação

**Módulo:** `src/modules/authentication/` · **Épico:** E1

## Responsabilidade

Sessão (Better Auth), redirects pós-login, guards de permissão/clínica, utilitários de auth.

## Fluxos

- Login (remember-me), sign-up, forgot/reset password
- 2FA opcional (TOTP + códigos de backup) via plugin Better Auth; desafio em `/two-factor` após senha quando `twoFactorEnabled`
- Remember-me no login (`rememberMe`; default ligado — cookie persistente 7 dias; desligado = cookie de sessão)
- Gestão de sessões em `/account/security`: listar dispositivos, revogar uma (nunca a atual) ou todas as outras
- Modal pós-login incentivando 2FA quando ainda desligado (flag Zustand; some em “Continuar desprotegido” nesta sessão)
- Sign-up exige aceite obrigatório dos Termos de Uso e da Política de Privacidade (`acceptTerms` no `signUpSchema`; campo não é enviado ao Better Auth). Links abrem modal via intercepting routes (`@modal/(.)termos` / `(.)privacidade`)
- Verify email; change-password (senha provisória); em `/account/security` a troca de senha é por modal e pode encerrar as outras sessões
- Ordem canônica de redirect: `post-auth-redirect.ts` (ver [Diagramas](Diagramas))
- Invite paths podem preceder verify-email (token prova ownership)
- Pós-login com membership: `useSignInMutation` faz seed do cache da sessão (`setQueryData`) + `SessionBootstrapOverlay` (`LoadingScreen`) até o `AppShell` confirmar auth/permissions no client — evita nav vazia no primeiro paint
- Troca de clínica (`useSwitchClinicMutation`): atualiza o scope do hash (`setQueryClinicId`), `queryClient.clear()` + reseed da session — sem `invalidateQueries()` global (evita storm de refetch da sessão já seedada e de orphans da clínica anterior). Queries montadas fazem cold fetch no novo scope; `ClinicIndicator` ainda chama `router.refresh()` para RSC/permissions
- Layouts RSC (root + segmentos autenticados) usam `getCachedSession` (`React.cache`) — um `getSession` por request HTTP, compartilhado entre root e layout de segmento

## Regras

- Proxy/cookie: paths públicos vs autenticados (`src/proxy.ts`) — inclui hub `/legal` e docs (`/termos`, `/privacidade`, `/cookies`, `/contrato-saas`, `/dpa`, `/seguranca`, `/retencao`, `/incidentes`, `/ropa`)
- `requireClinic` / `assertClinicEntitled` bloqueiam clínica sem assinatura viva (produto)
- `requireOwnedClinicTeardown` — exclusão de clínica owned **sem** exigir entitlement
- Conta (`/account`): owner com assinatura bloqueada acessa self-service de billing
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

`permissions/guards.ts`, `utils/post-auth-redirect.ts`, `utils/get-cached-session.ts`, `queries/auth.query.ts`, `hooks/use-auth.ts` (seed de sessão no sign-in / clear+reseed no switch de clínica), `SessionBootstrapOverlay`, `stores/auth.store.ts` (`isBootstrappingSession`, `pendingTwoFactorNudge`), `TwoFactorNudgeDialog`, `/two-factor`
