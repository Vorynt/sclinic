# Domínio — Usuários e equipe

**Módulo:** `src/modules/users/` · **Épico:** E1

## Responsabilidade

Membros da clínica, convites assignable, conta do usuário (`/account/*`).

## Features

- `/users` — TeamPanel (membros + convites)
- Invite TTL 7 dias; roles: `admin|manager|receptionist|financial`
- Suspender / reativar membro (permanece na listagem)
- Soft-remove → `status=removed` + `deletedAt` (some da listagem; histórico/FK preservados; libera vaga)
- Conta: overview, **clínicas** (`/account/clinics`), profile, security (senha via modal + 2FA + sessões), subscription (se houver row)
- `/account/clinics`: listar memberships; **Acessar** (switch, se entitled); **Sair** (membro, soft-remove); **Excluir** (dono, teardown existente)

## Regras

- Não atribuir `owner` / `clinician` / `nurse` por este fluxo
- `assertPlanCapacity(users)` antes de convidar (ADR-004)
- Quota de usuários conta só memberships **`active`** (suspensos e removidos não ocupam vaga)
- Não alterar owner nem a si mesmo (`member-rules`)
- Quota de plano bloqueia novos invites quando over/at limit
- Owner **não** sai da clínica — precisa excluí-la; membro sai e, se era a clínica da sessão, `activeClinicId` é limpo

## Schema invite

name, email, roleKey; senha no aceite ≥ 8.

## Ver também

- [RBAC](RBAC-e-Permissoes)
- [Assinatura SaaS](Dominio-Assinatura-SaaS)
- [Profissionais](Dominio-Profissionais) (outro fluxo de convite)
