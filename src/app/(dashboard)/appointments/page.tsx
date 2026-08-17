import type { Metadata } from "next";
import { Suspense } from "react";

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock";
import { Permission } from "@/config/permissions";
import { AppointmentsPanel } from "@/modules/appointments/components/AppointmentsPanel";
import { AppointmentsRouteSkeleton } from "@/modules/appointments/components/AppointmentsRouteSkeleton";
import { PermissionProvider } from "@/providers/PermissionProvider";

export const metadata: Metadata = {
  title: "Agendamentos",
};

export default function AppointmentsPage() {
  return (
    <PermissionProvider
      permissions={[
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_UPDATE,
      ]}
      mode="any"
      fallback={<ForbiddenBlock />}>
      <Suspense fallback={<AppointmentsRouteSkeleton />}>
        <AppointmentsPanel />
      </Suspense>
    </PermissionProvider>
  );
}
