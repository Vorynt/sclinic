import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { ProfessionalsPageSkeleton } from "@/modules/professionals/components/ProfessionalsPageSkeleton"
import { ProfessionalsPanel } from "@/modules/professionals/components/ProfessionalsPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Profissionais · sclinic",
}

export default function ProfessionalsPage() {
  return (
    <PermissionProvider
      permission={Permission.PROFESSIONALS_MANAGE}
      fallback={<ForbiddenBlock />}
    >
      <Suspense fallback={<ProfessionalsPageSkeleton />}>
        <ProfessionalsPanel />
      </Suspense>
    </PermissionProvider>
  )
}
