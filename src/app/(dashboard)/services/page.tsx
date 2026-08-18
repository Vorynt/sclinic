import type { Metadata } from "next";
import { Suspense } from "react";

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock";
import { Permission } from "@/config/permissions";
import { ClinicServicesPageSkeleton } from "@/modules/billing/components/ClinicServicesPageSkeleton";
import { ClinicServicesPanel } from "@/modules/billing/components/ClinicServicesPanel";
import { PermissionProvider } from "@/providers/PermissionProvider";

export const metadata: Metadata = {
  title: "Serviços",
};

export default function ServicesPage() {
  return (
    <PermissionProvider
      permission={Permission.FINANCIAL_VIEW}
      fallback={<ForbiddenBlock />}>
      <Suspense fallback={<ClinicServicesPageSkeleton />}>
        <ClinicServicesPanel />
      </Suspense>
    </PermissionProvider>
  );
}
