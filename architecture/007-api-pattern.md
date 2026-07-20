# 007 — API Pattern

## Regra

Nunca chamar `fetch` diretamente espalhado pelo código.

## Camada

```
ApiClient
  → AuthInterceptor
    → Request
      → Response
        → ErrorHandler
```

Implementação em `shared/api/`.

## Server vs Client

- Preferir Server Actions + services no App Router.
- Usar `ApiClient` + React Query quando a UI no cliente precisar de dados interativos (polling, cache client-side, etc.).

## React Query

- Factories em `modules/<feature>/queries/` e `mutations/`.
- Hooks como `usePatients()` encapsulam `useQuery` — não espalhar `useQuery(...)` solto.
