import type { Metadata } from "next"
import { Suspense } from "react"

import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
import { PatientsPanel } from "@/modules/patients/components/PatientsPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Pacientes · sclinic",
}

export default function PatientsPage() {
  return (
    <PermissionProvider
      permission={Permission.PATIENTS_READ}
      fallback={
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para visualizar pacientes.
        </p>
      }
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        }
      >
        <PatientsPanel />
      </Suspense>
    </PermissionProvider>
  )
}
