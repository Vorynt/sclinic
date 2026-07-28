import type { ReactNode } from "react"

/**
 * Minimal chrome for print surfaces (prescription letterhead, etc.).
 */
export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-white text-black print:bg-white">
      {children}
    </div>
  )
}
