import type { PageAction } from "@/types/page-action"

export type ResolvedPageActions = {
  primary: PageAction | null
  secondary: PageAction[]
}

/**
 * Splits page actions into one primary (larger FAB / filled button) and
 * zero-or-more secondary (smaller FAB / outline buttons).
 */
export function resolvePageActions(
  actions: readonly PageAction[],
): ResolvedPageActions {
  if (actions.length === 0) {
    return { primary: null, secondary: [] }
  }

  const explicitPrimary = actions.find((action) => action.priority === "primary")
  const primary = explicitPrimary ?? actions[actions.length - 1]!
  const secondary = actions.filter((action) => action.id !== primary.id)

  return { primary, secondary }
}
