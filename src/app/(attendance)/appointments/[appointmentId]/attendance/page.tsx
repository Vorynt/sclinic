import { AttendanceOverviewPanel } from "@/modules/appointments/components/AttendanceOverviewPanel";

type AttendancePageProps = {
  params: Promise<{ appointmentId: string }>;
};

export default async function AttendancePage({ params }: AttendancePageProps) {
  const { appointmentId } = await params;

  return <AttendanceOverviewPanel appointmentId={appointmentId} />;
}
