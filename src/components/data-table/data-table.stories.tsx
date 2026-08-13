import { PencilSimpleIcon, TrashIcon, UserIcon } from "@phosphor-icons/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./DataTablePagination"
import { DataTableSearch } from "./DataTableSearch"
import { ListCard } from "./ListCard"
import { ListCardSkeleton } from "./ListCardSkeleton"
import { ResponsiveDataView } from "./ResponsiveDataView"

const meta = {
  title: "Organisms/DataTable",
  parameters: {
    docs: {
      description: {
        component:
          "Peças genéricas de listagem: busca, paginação, dual layout (tabela `md+` / cards densos no mobile, estilo ChargeCard) e ListCard.",
      },
    },
  },
} satisfies Meta

export default meta

type SearchStory = StoryObj<typeof DataTableSearch>
type PaginationStory = StoryObj<typeof DataTablePagination>

const DEMO_ROWS = [
  {
    id: "1",
    name: "Ana Silva",
    cpf: "123.456.789-00",
    phone: "(11) 98888-1111",
    email: "ana@email.com",
  },
  {
    id: "2",
    name: "Bruno Costa",
    cpf: "987.654.321-00",
    phone: "(21) 97777-2222",
    email: "bruno@email.com",
  },
]

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
    <DataTablePagination
      page={1}
      pageSize={20}
      total={12}
      onPageChange={() => {}}
    />
  ),
}

export const ListCardDense: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "Opção A: fila densa (título + preview + ações). Detalhes no collapse compacto.",
      },
    },
  },
  render: () => (
    <div className="mx-auto flex max-w-md flex-col gap-2">
      {DEMO_ROWS.map((row, index) => (
        <ListCard
          key={row.id}
          collapsible
          defaultOpen={index === 0}
          leading={<UserIcon weight="duotone" />}
          title={row.name}
          badges={<Badge variant="secondary">Ativo</Badge>}
          preview={`${row.cpf} · ${row.phone}`}
          meta={[
            { label: "CPF", value: row.cpf },
            { label: "Telefone", value: row.phone },
            { label: "E-mail", value: row.email },
          ]}
          actions={
            <ButtonGroup>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                tooltip="Editar">
                <PencilSimpleIcon />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                tooltip="Remover">
                <TrashIcon />
                <span className="sr-only">Remover</span>
              </Button>
            </ButtonGroup>
          }
        />
      ))}
    </div>
  ),
}

export const ListCardFlat: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "Sem collapse — título, preview e ações numa fila (ex.: serviços com preço em trailing).",
      },
    },
  },
  render: () => (
    <div className="mx-auto flex max-w-md flex-col gap-2">
      <ListCard
        leading={<UserIcon weight="duotone" />}
        title="Consulta retorno"
        badges={<Badge variant="secondary">Ativo</Badge>}
        trailing={
          <span className="text-sm font-semibold tabular-nums">R$ 180,00</span>
        }
        actions={
          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              tooltip="Editar">
              <PencilSimpleIcon />
              <span className="sr-only">Editar</span>
            </Button>
          </ButtonGroup>
        }
      />
    </div>
  ),
}

export const ListCardSkeletonStory: StoryObj = {
  name: "ListCardSkeleton",
  render: () => (
    <div className="mx-auto max-w-md">
      <ListCardSkeleton rows={3} />
    </div>
  ),
}

export const ResponsiveDualLayout: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "ResponsiveDataView: redimensione o viewport — tabela em `md+`, cards densos abaixo.",
      },
    },
  },
  render: () => (
    <ResponsiveDataView
      desktop={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.cpf}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      mobile={
        <div className="flex flex-col gap-2">
          {DEMO_ROWS.map((row) => (
            <ListCard
              key={row.id}
              collapsible
              title={row.name}
              preview={`${row.cpf} · ${row.phone}`}
              meta={[
                { label: "CPF", value: row.cpf },
                { label: "Telefone", value: row.phone },
                { label: "E-mail", value: row.email },
              ]}
            />
          ))}
        </div>
      }
    />
  ),
}
