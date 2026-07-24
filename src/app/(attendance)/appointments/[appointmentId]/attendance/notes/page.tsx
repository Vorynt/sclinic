import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { ClinicalNotesPanel } from "@/modules/medical-records/components/ClinicalNotesPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

type AttendanceNotesPageProps = {
  params: Promise<{ appointmentId: string }>
}

export default async function AttendanceNotesPage({
  params,
}: AttendanceNotesPageProps) {
  const { appointmentId } = await params

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <ClinicalNotesPanel appointmentId={appointmentId} />
    </PermissionProvider>
  )
}
