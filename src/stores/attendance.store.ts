/**
 * AttendanceUiStore — client-only UI flags for attendance transitions.
 * Appointment domain data lives in TanStack Query.
 */
import { create } from "zustand"

type AttendanceUiState = {
  /** Full-screen overlay while navigating into the attendance workspace. */
  isPreparingAttendance: boolean
  beginPreparingAttendance: () => void
  endPreparingAttendance: () => void
}

export const useAttendanceUiStore = create<AttendanceUiState>((set) => ({
  isPreparingAttendance: false,
  beginPreparingAttendance: () => set({ isPreparingAttendance: true }),
  endPreparingAttendance: () => set({ isPreparingAttendance: false }),
}))
