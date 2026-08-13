import type { Icon } from "@phosphor-icons/react"

/**
 * Declarative page-level action for `PageHeader` (desktop) and
 * `PageActionsFab` (mobile shell chrome).
 */
export type PageAction = {
  id: string
  label: string
  onClick: () => void
  icon?: Icon
  /**
   * Explicit priority. When omitted, the last action in the list is primary
   * and the rest are secondary.
   */
  priority?: "primary" | "secondary"
}
