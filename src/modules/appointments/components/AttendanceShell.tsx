import type { ReactNode } from "react"

import { AttendanceShellHeader } from "@/modules/appointments/components/AttendanceShellHeader"

type AttendanceShellProps = {
  children: ReactNode
}

/**
 * Dedicated clinical chrome for attendance — no AppShell sidebar/header.
 */
export function AttendanceShell({ children }: AttendanceShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AttendanceShellHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
