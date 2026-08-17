/**
 * Product tour UI flags only — completion lives on AuthUser (TanStack Query).
 */
import { create } from "zustand"

type ProductTourUiState = {
  isPromptOpen: boolean
  isTourActive: boolean
  setPromptOpen: (open: boolean) => void
  setTourActive: (active: boolean) => void
  /** Incremented to start the tour from Ajuda (replay). */
  replayNonce: number
  requestReplay: () => void
}

export const useProductTourUiStore = create<ProductTourUiState>((set) => ({
  isPromptOpen: false,
  isTourActive: false,
  setPromptOpen: (open) => set({ isPromptOpen: open }),
  setTourActive: (active) => set({ isTourActive: active }),
  replayNonce: 0,
  requestReplay: () => set((state) => ({ replayNonce: state.replayNonce + 1 })),
}))
