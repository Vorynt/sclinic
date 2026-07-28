# Domínio — Clínicas

**Módulo:** `src/modules/clinics/` · **Épico:** E1

## Responsabilidade

CRUD da clínica, horários semanais, criação para owner (com attach de plano), exclusão (danger zone).

## Features

- Onboarding `/onboarding/clinic` + `/onboarding/hours`
- Settings geral / hours / danger
- Switcher + select-clinic (com estados suspended / assinatura bloqueada)
- `subscriptionStatus` denormalizado (espelho da assinatura do owner)

## Regras

- `createForOwner`: clinic + membership owner + plano (ADR-003)
- Timezone default `America/Sao_Paulo`
- Membership `suspended` aparece disabled no switcher
- Delete restrito a quem tem `settings.manage` (owner na prática)

## Schema (conceitual)

name, tradeName, document, email, phone, logo, website, timezone, endereço, subscriptionStatus; tabela `clinic_hours`.

## Decisões

Notebook `clinic-switcher-suspended`. ADR-003 (status espelhado).
