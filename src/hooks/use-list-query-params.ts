"use client"

import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs"

import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

export type ListQueryParams = {
  q?: string
  page?: number
  pageSize?: number
}

export function useListQueryParams() {
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
    },
    {
      history: "replace",
      shallow: true,
    },
  )

  const q = params.q.trim()
  const page = params.page < 1 ? 1 : params.page

  function setQ(nextQ: string) {
    const trimmed = nextQ.trim()
    void setParams({
      q: trimmed.length > 0 ? trimmed : null,
      page: 1,
    })
  }

  function setPage(nextPage: number) {
    const safe = Math.max(1, nextPage)
    void setParams({
      page: safe <= 1 ? null : safe,
    })
  }

  const filters: ListQueryParams = {
    q: q.length > 0 ? q : undefined,
    page,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
  }

  return {
    ...filters,
    setQ,
    setPage,
  }
}
