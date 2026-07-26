import type { Metadata } from "next"
import { Suspense } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { BillingPageSkeleton } from "@/modules/billing/components/BillingPageSkeleton"
import { BillingPanel } from "@/modules/billing/components/BillingPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Faturamento · sclinic",
}

export default function BillingPage() {
  return (
    <PermissionProvider
      permission={Permission.FINANCIAL_VIEW}
      fallback={<ForbiddenBlock />}
    >
      <Suspense fallback={<BillingPageSkeleton />}>
        <BillingPanel />
      </Suspense>
    </PermissionProvider>
  )
}
