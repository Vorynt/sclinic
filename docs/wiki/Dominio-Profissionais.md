# Domínio — Profissionais

**Módulo:** `src/modules/professionals/` · **Épico:** E3 · **ADR:** 007

## Features

- Lista, convite, edição, active/inactive, soft delete
- Aceite `/invite/professional` + onboarding de perfil (conselho, pronome…)
- **Perfil clínico do owner** (sem invite): onboarding da clínica e CTA em `/professionals`
- Integração com agenda (só ativos; self-schedule para doctor/nurse)
- **Horário semanal próprio** (ADR-011): self-edit + override com `professionals.manage`

## Regras

- Perm: `professionals.manage` (CRUD de cadastro/convite)
- **Horários:** próprio profissional **ou** `professionals.manage` (ver [RBAC](RBAC-e-Permissoes))
- Create via invite: email + `roleKey` (`doctor|nurse`) + `affiliationType`
- Create owner profile: `createOwnerClinicalProfile` — exige membership `owner`; **não** troca o role RBAC
- `assertPlanCapacity(professionals)` (ADR-004) — perfil do owner conta na cota
- TTL convite 7 dias; e-mail do login deve coincidir
- Convite recusa e-mail já membro (owner não se auto-convida)
- Inactive não agenda
- Soft delete revoga convites pendentes

## Owner vs perfil clínico

| Conceito | Onde | Efeito |
|----------|------|--------|
| **Dono** | `clinic_memberships` role `owner` | Admin + assinatura SaaS |
| **Perfil clínico** | `professionals` + `professional_clinics` | Aparece na agenda como assignee |

Coexistem: um membership `owner` + um registro professional vinculado ao `userId`. Copy de UI evita “virar médico / mudar papel”.

## Status de conta (UI)

`invite_pending` | `invite_expired` | `invite_revoked` | `active` | `inactive`

## Affiliation

`attending` | `coordinator` | `locum` | `resident`
