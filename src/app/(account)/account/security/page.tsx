import type { Metadata } from "next";

import { AccountPageHeader } from "@/modules/users/components/AccountPageHeader";
import { AccountSecurityPanel } from "@/modules/users/components/AccountSecurityPanel";

export const metadata: Metadata = {
  title: "Segurança · Minha conta",
};

export default function AccountSecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountPageHeader
        title="Segurança"
        description="Senha, autenticação em duas etapas e sessões em outros dispositivos."
      />
      <AccountSecurityPanel />
    </div>
  );
}
