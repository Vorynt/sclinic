# 001 — Feature-Based Architecture

## Regra

Todo código de domínio vive em `src/modules/<feature>/`.

Cada módulo é um mini-projeto autocontido. Não espalhe arquivos de um domínio em pastas globais (`services/patients.ts`, `hooks/usePatients.ts`, etc.).

## Módulos previstos

- `patients`
- `appointments`
- `medical-records`
- `billing`
- `inventory`
- `dashboard`
- `settings`
- `users`
- `authentication`

## Estrutura obrigatória de um módulo

```
components/ actions/ services/ repositories/ schemas/ validators/
hooks/ queries/ mutations/ types/ dto/ mappers/ permissions/
constants/ utils/ tests/
```

## Exceções

Código realmente cross-cutting vai em `shared/` (api, errors, validators, auth helpers), `core/` (plataforma) ou no topo de `src/` (components, utils, types, providers). Se houver dúvida, comece no módulo.
