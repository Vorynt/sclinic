# 006 — Repositories

## Responsabilidade

Acesso a dados. Única camada que fala com o banco (Drizzle).

## Regras

- Nome: `<entity>.repository.ts`.
- Sem regra de negócio (isso é do service).
- Retorna tipos de domínio ou DTOs mapeados — não vaze detalhes do ORM para a UI.
- Um repository por agregado/entidade principal do módulo.
- Toda operação Drizzle deve passar por `withDbError` (`src/db/with-db-error.ts`).

## Erros

```ts
import { withDbError } from "@/db/with-db-error"

export const patientRepository = {
  async create(data: CreatePatientDto): Promise<Patient> {
    return withDbError(async () => {
      const [row] = await db.insert(patients).values(data).returning()
      return toPatient(row)
    })
  },
}
```

- Driver/ORM → `TechnicalError` (`DB_UNIQUE_VIOLATION`, `DB_FOREIGN_KEY_VIOLATION`, …)
- Service mapeia `TechnicalError` → `AppError` de domínio
- Não lançar `AppError` no repository

## Localização

`modules/<feature>/repositories/`

Client Drizzle, schema, migrations e `withDbError` ficam exclusivamente em `src/db/`.
