import type { Metadata } from "next"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { ChargesPrintView } from "@/modules/billing/components/ChargesPrintView"
import { billingInsightsSchema } from "@/modules/billing/schemas/charge.schema"
import type { ExportChargesInput } from "@/modules/billing/schemas/charge.schema"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Faturamento",
}

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function parsePrintFilters(searchParams: SearchParams): ExportChargesInput {
  const status = first(searchParams.status)
  const kind = first(searchParams.kind)
  const method = first(searchParams.method)
  const parsed = billingInsightsSchema.safeParse({
    q: first(searchParams.q),
    status: status && status !== "all" ? status : undefined,
    overdue: first(searchParams.overdue),
    from: first(searchParams.from),
    to: first(searchParams.to),
    periodAll: first(searchParams.all),
    serviceId: first(searchParams.serviceId),
    billingKind: kind && kind !== "all" ? kind : undefined,
    method: method && method !== "all" ? method : undefined,
    patientId: first(searchParams.patientId),
  })
  return parsed.success ? parsed.data : {}
}

type BillingPrintPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function BillingPrintPage({
  searchParams,
}: BillingPrintPageProps) {
  const params = await searchParams
  const autoPrint = first(params.preview) !== "1"
  const filters = parsePrintFilters(params)

  return (
    <PermissionProvider
      permission={Permission.FINANCIAL_VIEW}
      fallback={<ForbiddenBlock />}
    >
      <ChargesPrintView filters={filters} autoPrint={autoPrint} />
    </PermissionProvider>
  )
}
