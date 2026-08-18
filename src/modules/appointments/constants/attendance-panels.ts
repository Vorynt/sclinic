export const ATTENDANCE_PANELS = [
  "vitals",
  "documents",
  "patient",
  "next",
] as const

export type AttendancePanel = (typeof ATTENDANCE_PANELS)[number]

export function isAttendancePanel(
  value: string | null | undefined,
): value is AttendancePanel {
  return (
    value === "vitals" ||
    value === "documents" ||
    value === "patient" ||
    value === "next"
  )
}
