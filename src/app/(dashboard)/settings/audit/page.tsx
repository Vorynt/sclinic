import type { Metadata } from "next";

import { AuditLogsPanel } from "@/modules/audit/components/AuditLogsPanel";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";

export const metadata: Metadata = {
  title: "Auditoria · Configurações · sclinic",
};

export default function SettingsAuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsPageHeader
        title="Auditoria"
        description="Histórico de ações na clínica — quem fez, o que mudou e quando."
      />
      <AuditLogsPanel />
    </div>
  );
}
