import type { ReactNode } from "react"

export type TableColumn<T> = {
  id: string
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
}

/** Label/value row inside a mobile `ListCard`. */
export type ListCardMetaItem = {
  label: string
  value: ReactNode
}
