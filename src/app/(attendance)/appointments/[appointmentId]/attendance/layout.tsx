import type { Metadata } from "next"
import type { ReactNode } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { AttendanceWorkspace } from "@/modules/appointments/components/AttendanceWorkspace"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Atendimento · sclinic",
}

type AttendanceLayoutProps = {
  children: ReactNode
  params: Promise<{ appointmentId: string }>
}

export default async function AttendanceLayout({
  children,
  params,
}: AttendanceLayoutProps) {
  const { appointmentId } = await params

  return (
    <PermissionProvider
      permissions={[
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_UPDATE,
      ]}
      mode="any"
      fallback={<ForbiddenBlock />}
    >
      <AttendanceWorkspace appointmentId={appointmentId}>
        {children}
      </AttendanceWorkspace>
    </PermissionProvider>
  )
}
