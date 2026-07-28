# Domínio — Clínicas

**Módulo:** `src/modules/clinics/` · **Épico:** E1 · **ADR:** 003, 007

## Responsabilidade

CRUD da clínica, horários semanais, criação para owner (com attach de plano), exclusão (danger zone).

## Features

- Onboarding `/onboarding/clinic` + `/onboarding/hours`
- Opção **“Você também atende pacientes nesta clínica?”** no create (ADR-007)
- Settings geral / hours / danger
- Switcher + select-clinic (com estados suspended / assinatura bloqueada)
- `subscriptionStatus` denormalizado (espelho da assinatura do owner)

## Regras

- `createForOwner`: clinic + membership owner + plano (ADR-003)
- Se `alsoPractices`: após membership, `createOwnerClinicalProfileForClinic` (ADR-007) — membership permanece `owner`
- Timezone default `America/Sao_Paulo`
- Membership `suspended` aparece disabled no switcher
- Delete restrito a quem tem `settings.manage` (owner na prática)

## Schema (conceitual)

name, tradeName, document, email, phone, logo, website, timezone, endereço, subscriptionStatus; tabela `clinic_hours`.

Form de create também aceita campos clínicos condicionais (`alsoPractices`, tipo de atuação, nome na agenda, conselho…) — não vão para a tabela `clinics`.

## Decisões

Notebook `clinic-switcher-suspended`. ADR-003 (status espelhado). ADR-007 (perfil clínico do owner).
