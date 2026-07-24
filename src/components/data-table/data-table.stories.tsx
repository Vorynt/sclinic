import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { DataTablePagination } from "./DataTablePagination"
import { DataTableSearch } from "./DataTableSearch"

const meta = {
  title: "Organisms/DataTable",
  parameters: {
    docs: {
      description: {
        component:
          "Peças genéricas de listagem: busca com debounce e paginação controlada (estado na URL via useListQueryParams nas páginas reais).",
      },
    },
  },
} satisfies Meta

export default meta

type SearchStory = StoryObj<typeof DataTableSearch>
type PaginationStory = StoryObj<typeof DataTablePagination>

export const Search: SearchStory = {
  render: function SearchStory() {
    const [value, setValue] = useState("")
    return (
      <div className="flex flex-col gap-2">
        <DataTableSearch
          value={value}
          onValueChange={setValue}
          placeholder="Buscar por nome ou CPF"
        />
        <p className="text-sm text-muted-foreground">Valor: {value || "—"}</p>
      </div>
    )
  },
}

export const Pagination: PaginationStory = {
  render: function PaginationStory() {
    const [page, setPage] = useState(1)
    return (
      <DataTablePagination
        page={page}
        pageSize={20}
        total={95}
        onPageChange={setPage}
      />
    )
  },
}

export const PaginationHiddenWhenSinglePage: PaginationStory = {
  render: () => (
    <DataTablePagination page={1} pageSize={20} total={12} onPageChange={() => {}} />
  ),
}
