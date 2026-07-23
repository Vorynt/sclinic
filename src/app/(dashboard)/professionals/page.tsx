import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
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
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        }
      >
        <ProfessionalsPanel />
      </Suspense>
    </PermissionProvider>
  )
}
