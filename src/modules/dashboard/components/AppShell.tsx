"use client"

import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/modules/dashboard/components/AppHeader"
import { AppSidebar } from "@/modules/dashboard/components/AppSidebar"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
