/**
 * AuthStore — client-only UI flags (sidebar/clinic switcher open, etc.).
 * Session/membership data lives in TanStack Query (authQueries).
 */
import { create } from "zustand"

type AuthUiState = {
  clinicSwitcherOpen: boolean
  setClinicSwitcherOpen: (open: boolean) => void
  /** Full-screen overlay while clinic switch + refresh settle. */
  isSwitchingClinic: boolean
  switchingClinicName: string | null
  beginClinicSwitch: (clinicName?: string | null) => void
  endClinicSwitch: () => void
}

export const useAuthUiStore = create<AuthUiState>((set) => ({
  clinicSwitcherOpen: false,
  setClinicSwitcherOpen: (open) => set({ clinicSwitcherOpen: open }),
  isSwitchingClinic: false,
  switchingClinicName: null,
  beginClinicSwitch: (clinicName = null) =>
    set({
      isSwitchingClinic: true,
      switchingClinicName: clinicName ?? null,
      clinicSwitcherOpen: false,
    }),
  endClinicSwitch: () =>
    set({ isSwitchingClinic: false, switchingClinicName: null }),
}))