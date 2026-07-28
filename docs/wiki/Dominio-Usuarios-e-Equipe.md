# Domínio — Usuários e equipe

**Módulo:** `src/modules/users/` · **Épico:** E1

## Responsabilidade

Membros da clínica, convites assignable, conta do usuário (`/account/*`).

## Features

- `/users` — TeamPanel (membros + convites)
- Invite TTL 7 dias; roles: `admin|manager|receptionist|financial`
- Soft-remove → `suspended`; reativação via novo aceite
- Conta: overview, profile, security, subscription (se living)

## Regras

- Não atribuir `owner` / `doctor` / `nurse` por este fluxo
- `assertPlanCapacity(users)` antes de convidar (ADR-004)
- Não alterar owner nem a si mesmo (`member-rules`)
- Quota de plano bloqueia novos invites quando over/at limit

## Schema invite

name, email, roleKey; senha no aceite ≥ 8.

## Relacionados

[RBAC](RBAC-e-Permissoes), [Assinatura SaaS](Dominio-Assinatura-SaaS), profissionais (outro fluxo de convite).
