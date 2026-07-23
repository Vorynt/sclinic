import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { TeamPageSkeleton } from "@/modules/users/components/TeamPageSkeleton"
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
      <Suspense fallback={<TeamPageSkeleton />}>
        <TeamPanel />
      </Suspense>
    </PermissionProvider>
  )
}
