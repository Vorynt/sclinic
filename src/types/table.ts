import type { ReactNode } from "react"

export type TableColumn<T> = {
  id: string
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
}
