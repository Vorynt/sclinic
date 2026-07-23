import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
import { AppointmentsPanel } from "@/modules/appointments/components/AppointmentsPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Agendamentos · sclinic",
}

export default function AppointmentsPage() {
  return (
    <PermissionProvider
      permissions={[Permission.APPOINTMENTS_CREATE, Permission.APPOINTMENTS_UPDATE]}
      mode="any"
      fallback={<ForbiddenBlock />}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        }
      >
        <AppointmentsPanel />
      </Suspense>
    </PermissionProvider>
  )
}
