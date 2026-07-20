# 003 — Import Rules

## Obrigatório

- Preferir alias `@/` em vez de caminhos relativos longos.
- Imports de domínio: `@/modules/<feature>/...`
- Imports de infra: `@/shared/...` (api, errors, validators) ou `@/core/...`
- Imports de app/UI: `@/components/...`, `@/utils/...`, `@/types/...`, `@/providers/...`
- Sem `any` (exceto casos documentados e justificados).
- Sem `console.log` em código de produção.

## Ordem de imports (Prettier / ESLint)

1. Built-ins / frameworks (`react`, `next`)
2. Pacotes externos
3. Aliases internos (`@/`)
4. Relativos locais (`./`, `../`)

## Boundaries

- `app/` pode importar de `modules/`, `shared/`, `core/`, `components/`, `providers/`.
- Um módulo **não** deve importar internals de outro módulo (ex.: `@/modules/patients/repositories/...` a partir de `billing`).
- Comunicação entre módulos: via contratos públicos (actions/services exportados) ou eventos em `core/events`.
