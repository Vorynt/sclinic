import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PatientsPageSkeleton } from "@/modules/patients/components/PatientsPageSkeleton"
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
      <Suspense fallback={<PatientsPageSkeleton />}>
        <PatientsPageClient />
      </Suspense>
    </PermissionProvider>
  )
}
