# 008 — Error Handling

## Princípios

- Erros tipados em `shared/errors/`.
- **Throw interno** (repository / service) + **Result na borda** (Server Action / envelope para UI).
- `ApiClient` mapeia HTTP → `AppError` e lança (React Query captura).
- Nunca engolir erros sem log (`core/logger`).
- Nunca vazar `cause` / stack / detalhes de DB para o client.

## Camadas

| Camada | Tipo | Comportamento |
|--------|------|----------------|
| Repository | `TechnicalError` via `withDbError` | Falhas de DB/infra com código estável (`DB_*`) |
| Service | `AppError` | Mapeia técnico → domínio (`PATIENT_NOT_FOUND`, `CONFLICT`, …) |
| Action | `ApiResponse<T>` | `toActionResult(() => service…)` |
| ApiClient | throw `AppError` | `mapHttpError` a partir do status/body |

## Contrato na borda

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; fields?: Record<string, string[]> } }
```

- `code` estável → observabilidade, i18n, mensagens na UI
- `message` via `getClientMessage(code)` — não hardcode no repository

## Fluxo

```
Repository throws TechnicalError
  → Service maps / throws AppError
    → Action: toActionResult → { success, data | error }
      → UI (Toast / form) usa `error.message` legível (`FormErrorAlert`); `error.code` fica para observabilidade/i18n, sem exibir o código ao usuário
```

## Arquivos

- `shared/errors/` — `AppError`, `TechnicalError`, `ValidationError`, `ErrorCode`, `toActionResult`
- `shared/validators/` — `parseOrThrow` (Zod → `ValidationError` com `fields`); forms no client usam RHF + `zodResolver` (ver [011](./011-form-validation.md))
- `db/with-db-error.ts` — mapeia Neon/Postgres/Drizzle → `TechnicalError` (`withDbError`)
- `shared/api/` — `apiClient`, `mapHttpError`
- `types/api.ts` — `ApiResponse`
- `core/logger/` — log estruturado
