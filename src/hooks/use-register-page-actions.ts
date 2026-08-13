"use client"

import { useEffect } from "react"

import { usePageActionsStore } from "@/stores/page-actions.store"
import type { PageAction } from "@/types/page-action"

/**
 * Registers declarative page actions with the AppShell chrome.
 * Pass a stable array (`useMemo`) so the store is not rewritten every render.
 */
export function useRegisterPageActions(actions: PageAction[] | undefined) {
  const setActions = usePageActionsStore((state) => state.setActions)
  const clearActions = usePageActionsStore((state) => state.clearActions)

  useEffect(() => {
    if (!actions?.length) {
      clearActions()
      return
    }

    setActions(actions)
    return () => {
      clearActions()
    }
  }, [actions, setActions, clearActions])
}
