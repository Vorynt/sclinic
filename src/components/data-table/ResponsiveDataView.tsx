import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ResponsiveDataViewProps = {
  desktop: ReactNode
  mobile: ReactNode
  className?: string
}

/**
 * Dual layout for list surfaces: table on `md+`, stacked cards below.
 * Pure CSS — both slots stay in the DOM to avoid hydration mismatch.
 */
export function ResponsiveDataView({
  desktop,
  mobile,
  className,
}: ResponsiveDataViewProps) {
  return (
    <div className={cn(className)}>
      <div className="hidden md:block">{desktop}</div>
      <div className="md:hidden">{mobile}</div>
    </div>
  )
}
