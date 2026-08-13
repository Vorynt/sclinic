/**
 * PageActionsStore — client-only chrome for dashboard page actions.
 * Domain data stays in TanStack Query; this only mirrors declarative
 * PageHeader actions so AppShell can render the mobile FAB stack.
 */
import { create } from "zustand"

import type { PageAction } from "@/types/page-action"

type PageActionsState = {
  actions: PageAction[]
  setActions: (actions: PageAction[]) => void
  clearActions: () => void
}

export const usePageActionsStore = create<PageActionsState>((set) => ({
  actions: [],
  setActions: (actions) => set({ actions }),
  clearActions: () => set({ actions: [] }),
}))
