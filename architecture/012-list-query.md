# 012 — List Query (tabelas)

## Regra

Listagens em tabela (pacientes, profissionais, equipe, …) usam **paginação e busca no servidor**, com estado de `q`/`page` na URL.

## Contrato

| Peça | Onde |
|------|------|
| Params + resultado | `src/types/pagination.ts` (`PaginationParams`, `PaginatedResult`, `getPageCount`) |
| Schema Zod base | `listQuerySchema` em `src/shared/validators/list-query.ts` |
| Estado URL | `useListQueryParams` em `src/hooks/use-list-query-params.ts` (`nuqs`) |
| UI genérica | `DataTableSearch` + `DataTablePagination` + `ResponsiveDataView` / `ListCard` em `src/components/data-table/` |

Módulos **estendem** `listQuerySchema` (ex.: `listPatientsSchema = listQuerySchema`) e tipam o DTO via `z.infer`. Filtros de domínio extra (status, período, etc.) entram no `.extend()` do schema do módulo e na URL via `nuqs` — exemplo: `listChargesSchema` em billing.

Defaults: `page = 1`, `pageSize = 10` (máx. 100). `sortBy` / `sortDir` estão no schema para uso futuro — sem UI ainda.

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
- Genérico em `src/components/data-table/` (Storybook): busca, paginação, dual layout (`ResponsiveDataView`: tabela `md+` / `ListCard` no mobile) e skeleton de card
- Ao mudar `q`, resetar `page` para `1` (feito em `useListQueryParams.setQ`)
- Não colocar `columns[]` de domínio no genérico — anti-padrão

## Fora deste padrão

- Agenda (filtro por intervalo de datas da grade, não da listagem 012)
- Comboboxes (busca própria + `limit`, sem paginação de tabela)

Filtros avançados de tabela (período, status, entidade) ficam no schema do módulo + URL (`nuqs`); billing é o exemplo canônico (`from`/`to`/`status`/`overdue`/…). Ordenação na UI ainda não.

Exportação completa (CSV / impressão) **não** reusa a query paginada do painel: CSV dispara na ação do botão; impressão abre `/billing/print` e carrega o recorte só lá.

## Anti-padrões

- Paginar só no client sobre o array completo
- Hard `.limit(100)` no lugar de page/pageSize
- Colunas de domínio em `src/components/`
- SQL fora de repositories
