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

## Mutations — callbacks e invalidação

Hooks de mutation aceitam `MutationCallbacks` (`src/types/mutation.ts`) para side-effects de UI — **sem** `try/catch` no client.

```ts
export type MutationCallbacks<TData = unknown> = {
  onSuccess?: (data: TData) => void
  onError?: (error: AppError) => void
}
```

### Regras

1. **`invalidateQueries` fica no hook** — sempre no `onSuccess` interno, com a query key do módulo. Nunca passar invalidação (nem keys) por props.
2. **Callbacks são opcionais** — toast, redirect, `setFormError`, `setError` de campo.
3. **Ordem no `onSuccess` do hook:** invalidar cache → chamar `onSuccess` da prop.
4. **No formulário:** use `mutate(data)`, não `mutateAsync` — o erro vai para `onError` e a UI não precisa de `try/catch`.
5. **`onError` recebe `AppError`** — o hook normaliza erros desconhecidos para `AppError(INTERNAL_ERROR)`.

### Exemplo (hook)

```ts
export function useSignInMutation({
  onSuccess,
  onError,
}: MutationCallbacks = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...authMutations.signIn(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(isAppError(error) ? error : new AppError(ErrorCode.INTERNAL_ERROR, { cause: error }))
    },
  })
}
```

### Exemplo (form)

```ts
const signIn = useSignInMutation({
  onSuccess: () => {
    toast.success("Login realizado com sucesso")
    router.replace(routes.dashboard)
  },
  onError: (error) => {
    setFormError({ message: error.message, code: error.code })
  },
})

const onSubmit = handleSubmit((data) => {
  setFormError(null)
  signIn.mutate(data)
})
```

Referência: `src/modules/authentication/hooks/use-auth.ts`.

### Anti-padrões

- `try/catch` em torno de `mutateAsync` no form para tratar erro de domínio.
- Passar `queryClient` / `invalidateQueries` / query keys via props do hook.
- Espalhar `useMutation({ onSuccess: () => invalidate… })` direto no component — invalidação pertence ao hook do módulo.
