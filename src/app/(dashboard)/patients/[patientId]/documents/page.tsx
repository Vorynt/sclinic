import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PatientPrescriptionsSection } from "@/modules/medical-records/components/PatientPrescriptionsSection"
import { PermissionProvider } from "@/providers/PermissionProvider"

type PatientDocumentsPageProps = {
  params: Promise<{ patientId: string }>
}

export default async function PatientDocumentsPage({
  params,
}: PatientDocumentsPageProps) {
  const { patientId } = await params

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <PatientPrescriptionsSection patientId={patientId} />
    </PermissionProvider>
  )
}
