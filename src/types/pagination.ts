export type PaginationParams = {
  page: number
  pageSize: number
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function getPageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0
  return Math.ceil(total / pageSize)
}

export function toPaginatedResult<T>(params: {
  items: T[]
  total: number
  page: number
  pageSize: number
}): PaginatedResult<T> {
  return {
    items: params.items,
    total: params.total,
    page: params.page,
    pageSize: params.pageSize,
  }
}
