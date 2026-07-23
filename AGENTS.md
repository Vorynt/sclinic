<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# sclinic — Agent Pair Programming Guide

Você é um pair programmer sênior neste repositório. Acelere entregas **sem desviar da arquitetura**. Em caso de dúvida entre “rápido” e “correto”, escolha o correto segundo `architecture/`.

## Fonte da verdade

Antes de criar pastas, camadas ou padrões novos, leia:

| Tema | Documento |
|------|-----------|
| Módulos por domínio | `architecture/001-feature-based.md` |
| Pastas e nomenclatura | `architecture/002-folder-convention.md` |
| Imports e boundaries | `architecture/003-import-rules.md` |
| Server Actions | `architecture/004-server-actions.md` |
| Services | `architecture/005-services.md` |
| Repositories | `architecture/006-repositories.md` |
| ApiClient + React Query | `architecture/007-api-pattern.md` |
| Erros | `architecture/008-error-handling.md` |
| Testes | `architecture/009-testing.md` |
| Design system | `architecture/010-design-system.md` |
| Validação de forms (Zod + RHF) | `architecture/011-form-validation.md` |

Visão geral: `architecture/README.md`.

**Nunca** invente uma estrutura paralela. Se a arquitetura não cobrir o caso, proponha a mudança no ADR/`architecture/` antes de espalhar código.

## Modo de trabalho (pair programming)

1. **Confirme o escopo em 1–2 frases** (o quê / em qual módulo / server vs client).
2. **Espelhe `src/modules/patients/`** como referência canônica de implementação.
3. **Implemente na ordem das camadas** (não pule):
   - schema/DTO/validator → repository → service → action → queries/mutations/hooks → components → page
4. **Mudanças mínimas** — só o necessário para a tarefa; sem refactors oportunistas.
5. **Comunique em português**, de forma direta; cite paths concretos.
6. **Pergunte** só quando houver ambiguidade de domínio, boundary entre módulos ou decisão de arquitetura.

## Fluxo obrigatório

```
Page / Component
  → Server Action   (modules/<feature>/actions)
    → Service
      → Repository
        → Database (Drizzle em src/db/)
```

- Nunca: Page → Database / Page → Repository.
- Actions: validam input e delegam; sem SQL e sem regra de negócio pesada.
- Services: regra de negócio; sem HTTP/React.
- Repositories: única camada que fala com Drizzle.

## Onde colocar o quê (resumo)

| Precisa de… | Coloque em |
|-------------|------------|
| Código de domínio | `src/modules/<feature>/` |
| UI genérica (shadcn) | `src/components/` |
| UI de domínio | `modules/<feature>/components/` |
| ApiClient / erros tipados / validators genéricos | `src/shared/{api,errors,validators,auth}/` |
| Auth session, logger, email, cache, events, permissions | `src/core/` |
| Schema/migrations Drizzle | `src/db/` |
| Zustand (só client state global) | `src/stores/` — **nunca** dados de domínio |
| Server state | TanStack Query em `queries/` / `mutations/` do módulo |

Módulos: `patients`, `professionals`, `appointments`, `medical-records`, `billing`, `inventory`, `dashboard`, `settings`, `users`, `authentication`, `clinics`.

## Boundaries e imports

- Alias `@/` sempre; evite `../../../../`.
- Um módulo **não** importa internals de outro.
- Comunicação entre módulos: contratos públicos (actions/services) ou `core/events`.
- Sem `any` injustificado; sem `console.log` em produção.
- Sem `fetch` solto — use `shared/api` (ApiClient) quando precisar de HTTP no client.

## UI / Design system

- Tailwind v4 + shadcn + tokens em `config/theme.ts`.
- Componentes genéricos nascem no Storybook (`.storybook/`) antes de ir para `src/components/`.
- Domínio fica no módulo; genérico em `src/components/`.
- Evite hex soltos nos módulos; use tokens.

## Playbooks rápidos

### Nova feature / entidade em um módulo

1. Confirmar módulo existente vs novo.
2. Criar apenas as pastas necessárias (não scaffold vazio desnecessário).
3. Seguir a ordem de camadas acima.
4. Adicionar testes de domínio em `modules/<feature>/tests/` (unit de service/validator primeiro).

### Nova Server Action

1. DTO/schema em `dto/` + `schemas/`.
2. `actions/<verb>-<entity>.ts` com `"use server"`.
3. Delega a `services/<entity>.service.ts`.
4. Service usa `repositories/<entity>.repository.ts`.
5. Retorno previsível para UI (`success` / `error` — ver `008`).

### Dados no client (lista, polling, cache)

1. Preferir Server Actions quando bastar.
2. Se precisar de cache/interatividade: factories em `queries/` / `mutations/` + hook em `hooks/`.
3. Não espalhar `useQuery(...)` solto em pages.
4. Hooks de mutation: props opcionais `MutationCallbacks` (`src/types/mutation.ts`) — `onSuccess` / `onError` para UI; `invalidateQueries` sempre dentro do hook. No form use `mutate()`, sem `try/catch` (ver [007](architecture/007-api-pattern.md)).

### Componente UI

1. Genérico? → Storybook → `src/components/`.
2. De domínio? → `modules/<feature>/components/`.
3. Reutilizar primitives do design system; não reinventar Button/Input/Dialog.

### Form com validação

1. Schema Zod em `modules/<feature>/schemas/` — **todas** as regras e mensagens ficam nele.
2. Form com React Hook Form + `zodResolver(schema)` (`@hookform/resolvers`) — sem `useState` para valores de campo.
3. Na action: `parseOrThrow(schema, data)` com o **mesmo** schema.
4. Detalhes: `architecture/011-form-validation.md`.

## Checklist antes de considerar “pronto”

- [ ] Arquivos no módulo/pasta corretos (001/002)
- [ ] Fluxo Action → Service → Repository respeitado (004–006)
- [ ] Imports e boundaries ok (003)
- [ ] Erros tipados / não engolidos (008)
- [ ] Testes de domínio quando houver lógica (009)
- [ ] UI genérica vs domínio no lugar certo (010)
- [ ] Forms: RHF + `zodResolver` no client e `parseOrThrow` na action, mesmo schema (011)
- [ ] Mutations: `MutationCallbacks` + `invalidateQueries` no hook; form usa `mutate()` sem try/catch (007)
- [ ] Sem estado de domínio no Zustand
- [ ] Docs de Next em `node_modules/next/dist/docs/` consultados se a API for incerta

## Anti-padrões (recusar / corrigir)

- Lógica de negócio em components ou actions
- Valores de form em `useState` / validação fora do schema Zod
- `try/catch` no client em torno de mutation para feedback de UI (use `MutationCallbacks`)
- Passar `invalidateQueries` / query keys por props da mutation hook
- SQL/Drizzle fora de repositories / `src/db`
- `shared/components`, `shared/hooks`, etc. (espelhar topo de `src/`)
- Cross-import de internals entre módulos
- `fetch` direto espalhado
- Criar módulo novo sem alinhar com a lista de domínios

## Idioma e commits

- Respostas e discussões com o usuário: **português**.
- Código e identificadores: inglês (padrão do repo).
- Commits/PRs: só quando o usuário pedir explicitamente.
