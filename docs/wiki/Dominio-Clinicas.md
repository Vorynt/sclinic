# Domínio — Clínicas

**Módulo:** `src/modules/clinics/` · **Épico:** E1 · **ADR:** 003, 007

## Responsabilidade

CRUD da clínica, horários semanais, criação para owner (com attach de plano), exclusão (danger zone).

## Features

- Onboarding `/onboarding/clinic` + `/onboarding/hours`
- Opção **“Você também atende pacientes nesta clínica?”** no create (ADR-007)
- Settings geral / hours / danger
- UI de horários: seletor por dia (aba da semana + editor focado) com copiar para seg–sex / semana / outro dia
- Fonte da verdade para disponibilidade de agendamento (enquanto o profissional não define agenda própria); sugestões de horário usam o fuso da clínica
- Switcher + select-clinic (membership suspended ≠ assinatura bloqueada)
- `subscriptionStatus` denormalizado (espelho da assinatura do owner)
- Exclusão com assinatura bloqueada (select-clinic) cancela Stripe imediatamente (ADR-003 amend)

## Regras

- `createForOwner`: clinic + membership owner + plano (ADR-003)
- Se `alsoPractices`: após membership, `createOwnerClinicalProfileForClinic` (ADR-007) — membership permanece `owner`
- Timezone default `America/Sao_Paulo`
- Membership `suspended` aparece disabled no switcher
- Delete: `requireOwnedClinicTeardown` (owner, **sem** exigir entitlement) + `cancelSubscriptionForUser`
- Horários com 2 intervalos: o segundo deve começar **depois** do fechamento do primeiro (ex.: `08:00–12:00` / `12:00–18:00` é inválido — precisa de pausa entre turnos)

## Schema (conceitual)

name, tradeName, document, email, phone, logo, website, timezone, endereço, subscriptionStatus; tabela `clinic_hours`.

Form de create também aceita campos clínicos condicionais (`alsoPractices`, tipo de atuação, nome na agenda, conselho…) — não vão para a tabela `clinics`.

## Decisões

Notebook `clinic-switcher-suspended`. ADR-003 (status espelhado). ADR-007 (perfil clínico do owner).
