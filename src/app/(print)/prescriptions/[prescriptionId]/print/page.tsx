import type { Metadata } from "next"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PrescriptionPrintView } from "@/modules/medical-records/components/PrescriptionPrintView"
import { PermissionProvider } from "@/providers/PermissionProvider"

export const metadata: Metadata = {
  title: "Receita · sclinic",
}

type PrescriptionPrintPageProps = {
  params: Promise<{ prescriptionId: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function PrescriptionPrintPage({
  params,
  searchParams,
}: PrescriptionPrintPageProps) {
  const { prescriptionId } = await params
  const { preview } = await searchParams
  const autoPrint = preview !== "1"

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <PrescriptionPrintView
        prescriptionId={prescriptionId}
        autoPrint={autoPrint}
      />
    </PermissionProvider>
  )
}
