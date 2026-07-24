import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { VitalSignsPanel } from "@/modules/medical-records/components/VitalSignsPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

type AttendanceVitalsPageProps = {
  params: Promise<{ appointmentId: string }>
}

export default async function AttendanceVitalsPage({
  params,
}: AttendanceVitalsPageProps) {
  const { appointmentId } = await params

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <VitalSignsPanel appointmentId={appointmentId} />
    </PermissionProvider>
  )
}
