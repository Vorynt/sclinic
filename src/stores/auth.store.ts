/**
 * AuthStore — client-only UI flags (sidebar/clinic switcher open, etc.).
 * Session/membership data lives in TanStack Query (authQueries).
 */
import { create } from "zustand"

type AuthUiState = {
  clinicSwitcherOpen: boolean
  setClinicSwitcherOpen: (open: boolean) => void
}

export const useAuthUiStore = create<AuthUiState>((set) => ({
  clinicSwitcherOpen: false,
  setClinicSwitcherOpen: (open) => set({ clinicSwitcherOpen: open }),
}))
