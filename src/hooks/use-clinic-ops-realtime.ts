"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import { chargesQueryKeys } from "@/modules/billing/queries/charges.query"

const SSE_PATH = "/api/realtime/clinic"
const RECONNECT_MS = 2_000

/**
 * Subscribes to clinic ops SSE and invalidates agenda/charge caches.
 * Safe to mount once on reception (or any multi-station ops surface).
 */
export function useClinicOpsRealtime(enabled = true) {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    let source: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let closed = false

    const invalidateOps = () => {
      const client = queryClientRef.current
      void Promise.all([
        client.invalidateQueries({ queryKey: appointmentsQueryKeys.all }),
        client.invalidateQueries({ queryKey: chargesQueryKeys.all }),
      ])
    }

    const connect = () => {
      if (closed) return
      source = new EventSource(SSE_PATH)

      source.addEventListener("clinic.ops", () => {
        invalidateOps()
      })

      source.onerror = () => {
        source?.close()
        source = null
        if (closed) return
        reconnectTimer = setTimeout(connect, RECONNECT_MS)
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      source?.close()
    }
  }, [enabled])
}
