# RBAC e permissões

Fontes: `src/config/permissions.ts`, `src/db/seed/rbac.ts` (`npm run db:seed:rbac`).

## Papéis

| key | Entrada |
|-----|---------|
| `owner` | Criação da clínica |
| `admin`, `manager`, `receptionist`, `financial` | Convite em Equipe |
| `doctor`, `nurse` | Convite em Profissionais |

## Matriz

| Permissão | owner | admin | manager | receptionist | doctor | nurse | financial |
|-----------|:-----:|:-----:|:-------:|:------------:|:------:|:-----:|:---------:|
| `patients.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `patients.write` | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| `appointments.create/update` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `appointments.delete` | ✓ | ✓ | ✓ | ✓ | — | — | — |
| `professionals.manage` | ✓ | ✓ | ✓ | — | — | — | — |
| `financial.view` | ✓ | ✓ | ✓ | — | — | — | ✓ |
| `financial.manage` | ✓ | ✓ | — | — | — | — | ✓ |
| `financial.collect` | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `settings.manage` | ✓ | ✓ | — | — | — | — | — |
| `members.invite` | ✓ | ✓ | ✓ | — | — | — | — |
| `records.read` | ✓ | ✓ | ✓ | — | ✓ | ✓ | — |
| `records.write` | ✓ | ✓ | — | — | ✓ | ✓ | — |
| `audit.read` | ✓ | ✓ | — | — | — | — | — |

## Regras além da matriz

- **Self-schedule:** doctor/nurse só a si.
- **Iniciar atendimento:** owner, admin, doctor, nurse (recepcionista **não**).
- **Equipe:** não alterar owner nem a si; soft-remove → `removed` + `deletedAt` (some da listagem); suspender ≠ remover.
- **Uso do plano:** `/settings/usage` só owner.
- **`collect` ≠ `view`:** cobrar na agenda sem acessar `/billing`.
- **Owner + perfil clínico (ADR-007):** membership permanece `owner` (sem dual-role). Perfil em `professionals` é opcional e independente; não confundir com membership `doctor`/`nurse`.

Guards: `src/modules/authentication/permissions/guards.ts`.
