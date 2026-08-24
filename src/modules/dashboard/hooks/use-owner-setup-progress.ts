"use client"

import { useMemo } from "react"

import { useOwnerHomeStatsQuery } from "@/modules/dashboard/hooks/use-owner-home-stats"
import {
  resolveOwnerSetupProgress,
  type OwnerSetupProgress,
} from "@/modules/dashboard/utils/owner-setup-progress"

export type UseOwnerSetupProgressResult = {
  progress: OwnerSetupProgress | null
  isLoading: boolean
  isError: boolean
}

/**
 * Derives owner setup roadmap progress from the aggregated home stats payload.
 * Card should hide when `progress.allComplete`.
 */
export function useOwnerSetupProgress(options?: {
  enabled?: boolean
}): UseOwnerSetupProgressResult {
  const enabled = options?.enabled ?? true
  const statsQuery = useOwnerHomeStatsQuery(enabled)

  const progress = useMemo(() => {
    if (!enabled || statsQuery.isLoading || statsQuery.isError || !statsQuery.data) {
      return null
    }

    return resolveOwnerSetupProgress(statsQuery.data.setup)
  }, [enabled, statsQuery.isLoading, statsQuery.isError, statsQuery.data])

  return {
    progress,
    isLoading: enabled && statsQuery.isLoading,
    isError: enabled && statsQuery.isError,
  }
}
