/**
 * AuthStore — client-only UI flags (clinic switcher, session bootstrap overlay, etc.).
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
  /** Full-screen overlay after sign-in until dashboard session/permissions settle. */
  isBootstrappingSession: boolean
  beginSessionBootstrap: () => void
  endSessionBootstrap: () => void
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
  isBootstrappingSession: false,
  beginSessionBootstrap: () => set({ isBootstrappingSession: true }),
  endSessionBootstrap: () => set({ isBootstrappingSession: false }),
}))