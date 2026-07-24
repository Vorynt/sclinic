import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock";
import { Permission } from "@/config/permissions";
import { SettingsNav } from "@/modules/settings/components/SettingsNav";
import { PermissionProvider } from "@/providers/PermissionProvider";

export const metadata: Metadata = {
  title: "Configurações · sclinic",
};

type SettingsLayoutProps = {
  children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <PermissionProvider
      permission={Permission.SETTINGS_MANAGE}
      fallback={<ForbiddenBlock />}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os dados e o funcionamento da clínica.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside>
            <SettingsNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </PermissionProvider>
  );
}
