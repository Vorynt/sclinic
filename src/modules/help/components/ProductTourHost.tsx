"use client"

import { driver, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import "@/modules/help/components/product-tour.css"
import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"

import { getVisibleShellNav } from "@/modules/dashboard/constants/nav"
import { ProductTourPromptDialog } from "@/modules/help/components/ProductTourPromptDialog"
import { useCompleteProductTourMutation } from "@/modules/help/hooks/use-complete-product-tour"
import { filterProductTourSteps } from "@/modules/help/utils/filter-product-tour-steps"
import { findVisibleTourTarget } from "@/modules/help/utils/find-visible-tour-target"
import { useAuth } from "@/providers/AuthProvider"
import { useAuthUiStore } from "@/stores/auth.store"
import { useProductTourUiStore } from "@/stores/product-tour.store"

export function ProductTourHost() {
  const { auth, canAny } = useAuth()
  const isBootstrappingSession = useAuthUiStore((s) => s.isBootstrappingSession)
  const isPromptOpen = useProductTourUiStore((s) => s.isPromptOpen)
  const setPromptOpen = useProductTourUiStore((s) => s.setPromptOpen)
  const setTourActive = useProductTourUiStore((s) => s.setTourActive)
  const replayNonce = useProductTourUiStore((s) => s.replayNonce)

  const driverRef = useRef<ReturnType<typeof driver> | null>(null)
  const completingRef = useRef(false)
  const promptShownRef = useRef(false)
  const startedFromPromptRef = useRef(false)
  const lastReplayNonceRef = useRef(0)

  const complete = useCompleteProductTourMutation({
    onError: (error) => {
      completingRef.current = false
      toast.error(error.message)
    },
  })

  const persistCompletion = useCallback(() => {
    if (auth?.user.productTourCompleted) return
    if (completingRef.current) return
    completingRef.current = true
    complete.mutate()
  }, [auth?.user.productTourCompleted, complete])

  const stopTour = useCallback(() => {
    driverRef.current?.destroy()
    driverRef.current = null
    setTourActive(false)
  }, [setTourActive])

  const startTour = useCallback(() => {
    if (!auth) return
    stopTour()

    const nav = getVisibleShellNav(canAny)
    const steps = filterProductTourSteps(nav)
    const driveSteps: DriveStep[] = steps.flatMap((step) => {
      const element = findVisibleTourTarget(step.id)
      if (!element) return []
      return [
        {
          element,
          popover: {
            title: step.title,
            description: step.description,
          },
        },
      ]
    })

    if (driveSteps.length === 0) {
      persistCompletion()
      return
    }

    const instance = driver({
      steps: driveSteps,
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Próximo",
      prevBtnText: "Voltar",
      doneBtnText: "Concluir",
      popoverClass: "sclinic-product-tour",
      overlayColor: "#000",
      overlayOpacity: 0.5,
      stagePadding: 8,
      stageRadius: 10,
      disableActiveInteraction: true,
      skipMissingElement: true,
      allowClose: true,
      overlayClickBehavior: "close",
      onDestroyed: () => {
        driverRef.current = null
        setTourActive(false)
        persistCompletion()
      },
    })

    driverRef.current = instance
    setTourActive(true)
    instance.drive()
  }, [auth, canAny, persistCompletion, setTourActive, stopTour])

  useEffect(() => {
    if (!auth || isBootstrappingSession || promptShownRef.current) return
    if (auth.user.productTourCompleted) return
    promptShownRef.current = true
    startedFromPromptRef.current = false
    setPromptOpen(true)
  }, [auth, isBootstrappingSession, setPromptOpen])

  useEffect(() => {
    if (replayNonce === 0 || replayNonce === lastReplayNonceRef.current) return
    lastReplayNonceRef.current = replayNonce
    setPromptOpen(false)
    startTour()
  }, [replayNonce, setPromptOpen, startTour])

  useEffect(() => {
    return () => {
      driverRef.current?.destroy()
      driverRef.current = null
    }
  }, [])

  const handleSkip = () => {
    setPromptOpen(false)
    if (startedFromPromptRef.current) return
    persistCompletion()
  }

  const handleStart = () => {
    startedFromPromptRef.current = true
    setPromptOpen(false)
    startTour()
  }

  return (
    <ProductTourPromptDialog
      open={isPromptOpen}
      onStart={handleStart}
      onSkip={handleSkip}
    />
  )
}
