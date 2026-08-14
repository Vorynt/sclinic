# Domínio — Profissionais

**Módulo:** `src/modules/professionals/` · **Épico:** E3 · **ADR:** 007, **012**

## Features

- Lista, convite, edição, active/inactive, soft delete
- Aceite `/invite/professional` + onboarding de perfil (conselho, pronome…)
- **Perfil clínico do owner** (sem invite): onboarding da clínica e CTA em `/professionals`
- Integração com agenda (só ativos; self-schedule para `clinician`/`nurse`)
- **Horário semanal próprio** (ADR-011): self-edit + override com `professionals.manage`
- **Multi-profissão (ADR-012):** `profession_type` no perfil (médico, dentista, fisio, etc.)

## Regras

- Perm: `professionals.manage` (CRUD de cadastro/convite)
- **Horários:** próprio profissional **ou** `professionals.manage` (ver [RBAC](RBAC-e-Permissoes))
- Create via invite: email + `professionType` + `affiliationType`; service deriva `roleKey` (`nurse` → `nurse`, demais → `clinician`)
- Create owner profile: `createOwnerClinicalProfile` — exige membership `owner`; **não** troca o role RBAC; grava `professionType` no perfil
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
| **Tipo de profissão** | `professionals.profession_type` | Identidade clínica (médico, dentista, …); independente do RBAC |
| **Papel clínico RBAC** | `clinician` \| `nurse` | Capabilities (self-schedule, permissões) |

Coexistem: um membership `owner` + um registro professional vinculado ao `userId`. Copy de UI evita “mudar papel de dono”.

- Criação do perfil (dialog / onboarding): opção **usar o mesmo nome da conta** preenche e bloqueia “Nome completo na agenda”.
- Callout “criar perfil” em `/professionals` só aparece se **não existir** afiliação do owner na clínica — perfil **inativo** não dispara o alerta (reativar na lista).

## Status de conta (UI)

`invite_pending` | `invite_expired` | `invite_revoked` | `active` | `inactive`

## Affiliation

`attending` | `coordinator` | `locum` | `resident`

## Profissão (ADR-012)

`physician` | `dentist` | `physiotherapist` | `nurse` | `pharmacist` | `psychologist` | `other`

Conselhos: `CRM` | `CRO` | `COREN` | `CRF` | `CREFITO` | `CRP` | `OTHER`.
