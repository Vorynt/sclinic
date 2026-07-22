# 004 — Server Actions

## Fluxo obrigatório

```
Page / Component
  → Server Action   (modules/<feature>/actions)
    → Service
      → Repository
        → Database
```

Nunca: Page → Database.

## Convenções

- Um arquivo por action: `create-patient.ts`, `update-patient.ts`.
- Actions validam input com Zod (`parseOrThrow` em `shared/validators`) e delegam ao service.
- Forms no client usam o **mesmo** schema via React Hook Form + `zodResolver` — ver [011 — Form Validation](./011-form-validation.md).
- Actions não contêm SQL nem lógica de negócio pesada.
- Marcar com `"use server"` no topo do arquivo.

## Exemplo

```
PatientPage
  → createPatientAction
    → PatientService
      → PatientRepository
        → Drizzle
```
