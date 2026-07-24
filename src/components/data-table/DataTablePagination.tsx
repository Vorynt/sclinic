"use client"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import { getPageCount } from "@/types/pagination"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

type DataTablePaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

function buildPageItems(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const items: Array<number | "ellipsis"> = [1]

  if (page > 3) {
    items.push("ellipsis")
  }

  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  for (let current = start; current <= end; current += 1) {
    items.push(current)
  }

  if (page < pageCount - 2) {
    items.push("ellipsis")
  }

  items.push(pageCount)
  return items
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: DataTablePaginationProps) {
  const pageCount = getPageCount(total, pageSize)

  if (total <= pageSize || pageCount <= 1) {
    return null
  }

  const safePage = Math.min(Math.max(1, page), pageCount)
  const items = buildPageItems(safePage, pageCount)
  const from = (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {total}
      </p>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="pl-1.5!"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              aria-label="Página anterior"
            >
              <CaretLeftIcon data-icon="inline-start" />
              <span className="hidden sm:block">Anterior</span>
            </Button>
          </PaginationItem>

          {items.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <Button
                  type="button"
                  variant={item === safePage ? "outline" : "ghost"}
                  size="icon"
                  aria-current={item === safePage ? "page" : undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="pr-1.5!"
              disabled={safePage >= pageCount}
              onClick={() => onPageChange(safePage + 1)}
              aria-label="Próxima página"
            >
              <span className="hidden sm:block">Próximo</span>
              <CaretRightIcon data-icon="inline-end" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
