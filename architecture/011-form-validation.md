# 011 — Form Validation (Zod + React Hook Form)

## Regra

Validação de input usa **Zod**. Um único schema por operação vive em `modules/<feature>/schemas/` e é a **única** fonte de regras — client e server.

Todo formulário usa **React Hook Form** + `zodResolver` do `@hookform/resolvers`. Não guardar valores de campo em `useState`.

## Onde vive o quê

| Peça | Local |
|------|--------|
| Schema Zod da operação (regras e mensagens) | `modules/<feature>/schemas/` |
| Form state + validação client | `react-hook-form` + `zodResolver(schema)` |
| Parse na borda do server | `shared/validators` → `parseOrThrow` |
| Feedback de campo | `Field` / `FieldError` (`errors` do RHF) |
| Erro de formulário (domínio/servidor) | `FormErrorAlert` (mensagem legível; sem código técnico) / toast + `setError` |

## Fluxo

```
Form (React Hook Form)
  → zodResolver(schema)          // mesmas regras do Zod
  → mutation / Server Action
    → parseOrThrow(schema, data) // borda do server (nunca confiar só no client)
      → Service
```

## Client (forms)

1. Definir o schema em `modules/<feature>/schemas/` com todas as regras e mensagens.
2. `useForm` com `resolver: zodResolver(schema)` e `defaultValues`.
3. Tipar input/output quando houver transforms: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`.
4. Registrar campos com `register("field")` (ou `Controller` quando o controle não for nativo).
5. Exibir erros via `formState.errors` + `FieldError`.
6. No submit, enviar os dados validados à mutation via `mutate()` (não `mutateAsync`).
7. Side-effects de UI (toast, redirect, `FormErrorAlert`, `setError` de campo) via `MutationCallbacks` no hook — **sem** `try/catch`. Ver [007](./007-api-pattern.md).

```tsx
const signIn = useSignInMutation({
  onSuccess: () => router.replace(routes.dashboard),
  onError: (error) => setFormError({ message: error.message }),
})

const form = useForm<z.input<typeof signInSchema>, unknown, z.output<typeof signInSchema>>({
  resolver: zodResolver(signInSchema),
  defaultValues: { email: "", password: "" },
})

const onSubmit = form.handleSubmit((data) => {
  setFormError(null)
  signIn.mutate(data)
})
```

Referência: `src/modules/authentication/components/SignInForm.tsx`.

## Server (actions)

```ts
const parsed = parseOrThrow(signInSchema, data)
return authService.signIn(parsed, …)
```

Ver também [004 — Server Actions](./004-server-actions.md) e [008 — Error Handling](./008-error-handling.md).

## Anti-padrões

- Guardar valores de campo em `useState` / `onChange` manual.
- Validar com `if` / regex no componente (duplica o schema).
- Usar `parseForm` no submit do form em vez de `zodResolver`.
- Confiar só na validação do browser — use `noValidate` + Zod.
- Criar schema “só de UI” paralelo ao da action.
- Pular `parseOrThrow` na action porque o form já validou.
- Regras de validação fora do schema (mensagens hardcoded no JSX).
- `try/catch` + `mutateAsync` no submit para erros de domínio — use `onSuccess` / `onError` do hook.
