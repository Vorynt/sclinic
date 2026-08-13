"use client"

import { LoadingScreen } from "@/components/status/LoadingScreen"
import { useAuthUiStore } from "@/stores/auth.store"

/**
 * Full-screen overlay after sign-in until the dashboard session/permissions settle.
 * Mounted at the root so it survives the login → dashboard layout switch.
 */
export function SessionBootstrapOverlay() {
  const isBootstrappingSession = useAuthUiStore(
    (state) => state.isBootstrappingSession,
  )

  if (!isBootstrappingSession) return null

  return (
    <LoadingScreen
      message="Preparando seu ambiente…"
      description="Aguarde enquanto carregamos suas permissões."
    />
  )
}
