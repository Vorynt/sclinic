/**
 * AttendanceUiStore — client-only UI flags for attendance transitions.
 * Appointment domain data lives in TanStack Query.
 */
import { create } from "zustand"

type AttendancePanel = "vitals" | "documents" | "patient" | "next"

type AttendanceUiState = {
  /** Full-screen overlay while navigating into the attendance workspace. */
  isPreparingAttendance: boolean
  beginPreparingAttendance: () => void
  endPreparingAttendance: () => void
  /** Secondary cockpit panel; URL `?panel=` is the source of truth. */
  panel: AttendancePanel | null
  setPanel: (panel: AttendancePanel | null) => void
}

export const useAttendanceUiStore = create<AttendanceUiState>((set) => ({
  isPreparingAttendance: false,
  beginPreparingAttendance: () => set({ isPreparingAttendance: true }),
  endPreparingAttendance: () => set({ isPreparingAttendance: false }),
  panel: null,
  setPanel: (panel) => set({ panel }),
}))
