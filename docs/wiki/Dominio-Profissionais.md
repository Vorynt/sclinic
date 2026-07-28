# Domínio — Profissionais

**Módulo:** `src/modules/professionals/` · **Épico:** E3

## Features

- Lista, convite, edição, active/inactive, soft delete
- Aceite `/invite/professional` + onboarding de perfil (conselho, pronome…)
- Integração com agenda (só ativos; self-schedule para doctor/nurse)

## Regras

- Perm: `professionals.manage`
- Create = invite: email + `roleKey` (`doctor|nurse`) + `affiliationType`
- `assertPlanCapacity(professionals)` (ADR-004)
- TTL convite 7 dias; e-mail do login deve coincidir
- Inactive não agenda
- Soft delete revoga convites pendentes

## Status de conta (UI)

`invite_pending` | `invite_expired` | `invite_revoked` | `active` | `inactive`

## Affiliation

`attending` | `coordinator` | `locum` | `resident`
