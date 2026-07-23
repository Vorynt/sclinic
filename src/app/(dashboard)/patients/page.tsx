import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
import { PermissionProvider } from "@/providers/PermissionProvider"

import { PatientsPageClient } from "./patients-page-client"

export const metadata: Metadata = {
  title: "Pacientes · sclinic",
}

export default function PatientsPage() {
  return (
    <PermissionProvider
      permission={Permission.PATIENTS_READ}
      fallback={<ForbiddenBlock />}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        }
      >
        <PatientsPageClient />
      </Suspense>
    </PermissionProvider>
  )
}
