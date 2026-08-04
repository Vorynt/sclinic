# 008 — Error Handling

## Princípios

- Erros tipados em `shared/errors/`.
- **Throw interno** (repository / service) + **Result na borda** (Server Action / envelope para UI).
- `ApiClient` mapeia HTTP → `AppError` e lança (React Query captura).
- Nunca engolir erros sem log (`core/logger`).
- Nunca vazar `cause` / stack / detalhes de DB para o client.

## Camadas

| Camada     | Tipo                               | Comportamento                                                                                |
| ---------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Repository | `TechnicalError` via `withDbError` | Falhas de DB/infra com código estável (`DB_*`)                                               |
| Service    | `AppError`                         | Mapeia técnico → domínio (`PATIENT_NOT_FOUND`, `CONFLICT`, …); mensagem client-safe opcional |
| Action     | `ApiResponse<T>`                   | `toActionResult(() => service…)`                                                             |
| ApiClient  | throw `AppError`                   | `mapHttpError` a partir do status/body                                                       |

## Contrato na borda

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fields?: Record<string, string[]>;
      };
    };
```

- `code` estável → observabilidade, i18n, ramificações na UI
- `message` → preferir a mensagem do service (`AppError.message`) quando for client-safe; senão `getClientMessage(code)`
- Não hardcode mensagem no repository; detalhes de DB nunca vão para o client

## Fluxo

```
Repository throws TechnicalError
  → Service maps / throws AppError (mensagem específica quando o usuário pode corrigir)
    → Action: toActionResult → { success, data | error }
      → UI (Toast / form) usa `error.message` legível (`FormErrorAlert`); `error.code` fica para observabilidade/i18n, sem exibir o código ao usuário
```

## Mensagens para o usuário

- **Controlável pelo usuário** (duplicidade de CPF/CRM/e-mail, status inválido, horário indisponível): service lança `AppError` com `message` clara em português — a borda preserva essa mensagem.
- **Sem controle do usuário** (falha de DB genérica, rede, bug): código genérico + `getClientMessage` (“Algo deu errado…”).
- Unique violation (`DB_UNIQUE_VIOLATION`) deve ser mapeada no service (ex.: CPF, conselho, cobrança). Se escapar, a borda degrada para `CONFLICT` genérico — nunca vaza constraint/SQL.

## Arquivos

- `shared/errors/` — `AppError`, `TechnicalError`, `ValidationError`, `ErrorCode`, `toActionResult`, `resolveClientMessage`
- `shared/validators/` — `parseOrThrow` (Zod → `ValidationError` com `fields`); forms no client usam RHF + `zodResolver` (ver [011](./011-form-validation.md))
- `db/with-db-error.ts` — mapeia Neon/Postgres/Drizzle → `TechnicalError` (`withDbError`)
- `shared/api/` — `apiClient`, `mapHttpError`
- `types/api.ts` — `ApiResponse`
- `core/logger/` — log estruturado
