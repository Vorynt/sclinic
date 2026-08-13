import type { Metadata } from "next";
import { Suspense } from "react";

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock";
import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton";
import { Permission } from "@/config/permissions";
import { AppointmentNewPanel } from "@/modules/appointments/components/AppointmentNewPanel";
import { PermissionProvider } from "@/providers/PermissionProvider";

export const metadata: Metadata = {
  title: "Novo agendamento · sclinic",
};

function AppointmentNewPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeaderSkeleton />
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}

export default function AppointmentNewPage() {
  return (
    <PermissionProvider
      permission={Permission.APPOINTMENTS_CREATE}
      fallback={<ForbiddenBlock />}>
      <Suspense fallback={<AppointmentNewPageSkeleton />}>
        <AppointmentNewPanel />
      </Suspense>
    </PermissionProvider>
  );
}
