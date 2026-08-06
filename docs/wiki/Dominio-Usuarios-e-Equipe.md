# Domínio — Usuários e equipe

**Módulo:** `src/modules/users/` · **Épico:** E1

## Responsabilidade

Membros da clínica, convites assignable, conta do usuário (`/account/*`).

## Features

- `/users` — TeamPanel (membros + convites)
- Invite TTL 7 dias; roles: `admin|manager|receptionist|financial`
- Suspender / reativar membro (permanece na listagem)
- Soft-remove → `status=removed` + `deletedAt` (some da listagem; histórico/FK preservados; libera vaga)
- Conta: overview, profile, security, subscription (se living)

## Regras

- Não atribuir `owner` / `clinician` / `nurse` por este fluxo
- `assertPlanCapacity(users)` antes de convidar (ADR-004)
- Quota de usuários conta só memberships **`active`** (suspensos e removidos não ocupam vaga)
- Não alterar owner nem a si mesmo (`member-rules`)
- Quota de plano bloqueia novos invites quando over/at limit

## Schema invite

name, email, roleKey; senha no aceite ≥ 8.

## Relacionados

[RBAC](RBAC-e-Permissoes), [Assinatura SaaS](Dominio-Assinatura-SaaS), profissionais (outro fluxo de convite).
