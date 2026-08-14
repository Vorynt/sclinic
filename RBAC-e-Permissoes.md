# RBAC e permissões

Fontes: `src/config/permissions.ts`, `src/db/seed/rbac.ts` (`npm run db:seed:rbac`).

## Papéis

| key | Entrada |
|-----|---------|
| `owner` | Criação da clínica |
| `admin`, `manager`, `receptionist`, `financial` | Convite em Equipe |
| `clinician`, `nurse` | Convite em Profissionais (derivado de `professionType`; ADR-012) |

> Papel legado `doctor` foi migrado para `clinician` (label: **Profissional de saúde**).

## Matriz

| Permissão | owner | admin | manager | receptionist | clinician | nurse | financial |
|-----------|:-----:|:-----:|:-------:|:------------:|:---------:|:-----:|:---------:|
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

- **Self-schedule:** clinician/nurse só a si.
- **Horário do profissional:** o próprio profissional edita a grade semanal; quem tem `professionals.manage` pode ajustar em nome de qualquer um (override operacional). Demais papéis só enxergam a **disponibilidade efetiva** na agenda (slots), não a configuração da grade.
- **Bloqueios (`schedule_blocks`):** clinician/nurse só criam/removem o próprio; bloqueio **clinic-wide** (`professionalId` null) só recepção/gestão. Remoção na UI pelo card do bloqueio.
- **Iniciar atendimento:** owner, admin, clinician, nurse (recepcionista **não**).
- **Equipe:** não alterar owner nem a si; soft-remove → `removed` + `deletedAt` (some da listagem); suspender ≠ remover.
- **Uso do plano:** `/settings/usage` só owner.
- **`collect` ≠ `view`:** cobrar na agenda sem acessar `/billing`.
- **Owner + perfil clínico (ADR-007):** membership permanece `owner` (sem dual-role). Perfil em `professionals` é opcional e independente; não confundir com membership `clinician`/`nurse`.
- **Multi-profissão (ADR-012):** tipo de profissão (médico, dentista, fisio…) vive em `professionals.profession_type`; **não** há um role RBAC por profissão.

Guards: `src/modules/authentication/permissions/guards.ts`.
