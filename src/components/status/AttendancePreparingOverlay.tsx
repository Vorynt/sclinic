"use client"

import { LoadingScreen } from "@/components/status/LoadingScreen"
import { useAttendanceUiStore } from "@/stores/attendance.store"

/**
 * Full-screen overlay while the attendance workspace is being prepared.
 * Mounted at the root so it survives the dashboard → attendance layout switch.
 */
export function AttendancePreparingOverlay() {
  const isPreparingAttendance = useAttendanceUiStore(
    (state) => state.isPreparingAttendance,
  )

  if (!isPreparingAttendance) return null

  return (
    <LoadingScreen
      message="Preparando atendimento…"
      description="Aguarde enquanto preparamos o ambiente de atendimento."
    />
  )
}
