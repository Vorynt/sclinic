# Domínio — Autenticação

**Módulo:** `src/modules/authentication/` · **Épico:** E1

## Responsabilidade

Sessão (Better Auth), redirects pós-login, guards de permissão/clínica, utilitários de auth.

## Fluxos

- Login, sign-up, forgot/reset password
- Verify email; change-password (senha provisória)
- Ordem canônica de redirect: `post-auth-redirect.ts` (ver [Diagramas](Diagramas))
- Invite paths podem preceder verify-email (token prova ownership)

## Regras

- Proxy/cookie: paths públicos vs autenticados (`src/proxy.ts`)
- `requireClinic` / `assertClinicEntitled` bloqueiam clínica sem assinatura viva (produto)
- `requireOwnedClinicTeardown` — exclusão de clínica owned **sem** exigir entitlement
- Conta (`/account`): owner com assinatura bloqueada acessa self-service de billing
- Permissões resolvidas por membership + seed RBAC

## Decisões relacionadas

Notebook `auth-invite-email-verified`, `subscription-access-guard`.

## Arquivos-chave

`permissions/guards.ts`, `utils/post-auth-redirect.ts`, `queries/auth.query.ts`
