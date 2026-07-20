# 005 — Services

## Responsabilidade

O service concentra a regra de negócio do domínio.

## Regras

- Recebe dados já validados (via action + schema).
- Orquestra repositories e outros services (com cuidado entre módulos).
- Não conhece detalhes de HTTP / React.
- Nome: `<entity>.service.ts` (ex.: `patient.service.ts`).

## Localização

Sempre em `modules/<feature>/services/`.

`src/services/` fica reservado a serviços realmente transversais à aplicação.
