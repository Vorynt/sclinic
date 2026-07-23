"use client"

import { PulseIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { TextShimmer } from "@/components/ui/text-shimmer"
import { cn } from "@/lib/utils"

type LoadingScreenProps = {
  /** Primary shimmer label. */
  message?: string
  /** Optional supporting line under the shimmer. */
  description?: string
  className?: string
}

/**
 * Full-viewport loading surface (brand mark + shimmer copy).
 * Portaled to `document.body` so it covers the whole app while state resyncs.
 */
export function LoadingScreen({
  message = "Carregando…",
  description,
  className,
}: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent_50%)]" />

        <div className="animate-auth-orb absolute -top-28 left-[12%] size-88 rounded-full bg-primary/20 blur-3xl" />
        <div className="animate-auth-orb-alt absolute top-[28%] -right-24 size-104 rounded-full bg-chart-1/30 blur-3xl" />
        <div className="animate-auth-orb absolute -bottom-32 left-[30%] size-96 rounded-full bg-chart-3/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="animate-auth-fade-up relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_40%,transparent),0_16px_40px_-12px_var(--primary)]">
          <PulseIcon
            className="size-7 animate-pulse"
            weight="bold"
            aria-hidden
          />
        </span>

        <div className="flex flex-col items-center gap-2">
          <p className="font-heading text-xl font-semibold tracking-tight text-foreground">
            sclinic
          </p>
          <TextShimmer className="text-sm font-medium">{message}</TextShimmer>
          {description ? (
            <p className="max-w-xs text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
