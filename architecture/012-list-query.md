# 012 — List Query (tabelas)

## Regra

Listagens em tabela (pacientes, profissionais, equipe, …) usam **paginação e busca no servidor**, com estado de `q`/`page` na URL.

## Contrato

| Peça | Onde |
|------|------|
| Params + resultado | `src/types/pagination.ts` (`PaginationParams`, `PaginatedResult`, `getPageCount`) |
| Schema Zod base | `listQuerySchema` em `src/shared/validators/list-query.ts` |
| Estado URL | `useListQueryParams` em `src/hooks/use-list-query-params.ts` (`nuqs`) |
| UI genérica | `DataTableSearch` + `DataTablePagination` em `src/components/data-table/` |

Módulos **estendem** `listQuerySchema` (ex.: `listPatientsSchema = listQuerySchema`) e tipam o DTO via `z.infer`.

Defaults: `page = 1`, `pageSize = 20` (máx. 100). `sortBy` / `sortDir` estão no schema para uso futuro — sem UI ainda.

## Fluxo

```
Panel (useListQueryParams + DataTableSearch)
  → *Table (filters + DataTablePagination)
    → useXxxQuery(filters)
      → queries/*.query.ts (key inclui filters)
        → list-* Action (parseOrThrow list*Schema)
          → Service → Repository (count + limit/offset)
```

Actions retornam `ApiResponse<PaginatedResult<T>>`, não `T[]`.

## UI

- Domínio: colunas/ações em `modules/<feature>/components/*Table.tsx`
- Genérico: só busca + paginação em `src/components/data-table/` (Storybook)
- Ao mudar `q`, resetar `page` para `1` (feito em `useListQueryParams.setQ`)

## Fora deste padrão

- Agenda (filtro por intervalo de datas)
- Comboboxes (busca própria + `limit`, sem paginação de tabela)
- Filtros avançados / ordenação na UI (contrato preparado; implementar depois)

## Anti-padrões

- Paginar só no client sobre o array completo
- Hard `.limit(100)` no lugar de page/pageSize
- Colunas de domínio em `src/components/`
- SQL fora de repositories
