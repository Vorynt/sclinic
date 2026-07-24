import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PatientVitalSignsSection } from "@/modules/medical-records/components/PatientVitalSignsSection"
import { PermissionProvider } from "@/providers/PermissionProvider"

type PatientVitalsPageProps = {
  params: Promise<{ patientId: string }>
}

export default async function PatientVitalsPage({
  params,
}: PatientVitalsPageProps) {
  const { patientId } = await params

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <PatientVitalSignsSection patientId={patientId} />
    </PermissionProvider>
  )
}
