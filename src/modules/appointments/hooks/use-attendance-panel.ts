"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"

import {
  isAttendancePanel,
  type AttendancePanel,
} from "@/modules/appointments/constants/attendance-panels"
import { useAttendanceUiStore } from "@/stores/attendance.store"

export function useAttendancePanel() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const setStorePanel = useAttendanceUiStore((state) => state.setPanel)

  const panel = useMemo(() => {
    const value = searchParams.get("panel")
    return isAttendancePanel(value) ? value : null
  }, [searchParams])

  useEffect(() => {
    setStorePanel(panel)
  }, [panel, setStorePanel])

  const setPanel = useCallback(
    (next: AttendancePanel | null) => {
      setStorePanel(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next) {
        params.set("panel", next)
      } else {
        params.delete("panel")
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams, setStorePanel],
  )

  return { panel, setPanel }
}
