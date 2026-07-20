# 006 — Repositories

## Responsabilidade

Acesso a dados. Única camada que fala com o banco (Drizzle).

## Regras

- Nome: `<entity>.repository.ts`.
- Sem regra de negócio (isso é do service).
- Retorna tipos de domínio ou DTOs mapeados — não vaze detalhes do ORM para a UI.
- Um repository por agregado/entidade principal do módulo.

## Localização

`modules/<feature>/repositories/`

Client Drizzle, schema e migrations ficam exclusivamente em `src/db/`.
