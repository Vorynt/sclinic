import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Spinner } from "@/components/ui/spinner"
import { Permission } from "@/config/permissions"
import { TeamPanel } from "@/modules/users/components/TeamPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Equipe · sclinic",
}

export default function UsersPage() {
  return (
    <PermissionProvider
      permission={Permission.MEMBERS_INVITE}
      fallback={<ForbiddenBlock />}
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        }
      >
        <TeamPanel />
      </Suspense>
    </PermissionProvider>
  )
}
