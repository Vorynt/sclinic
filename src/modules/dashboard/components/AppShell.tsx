"use client";

import { useEffect, type ReactNode } from "react";

import { LoadingScreen } from "@/components/status/LoadingScreen";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlanOverLimitBanner } from "@/modules/billing/components/PlanOverLimitBanner";
import { AppHeader } from "@/modules/dashboard/components/AppHeader";
import { AppSidebar } from "@/modules/dashboard/components/AppSidebar";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthUiStore } from "@/stores/auth.store";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { auth } = useAuth();
  const isSwitchingClinic = useAuthUiStore((s) => s.isSwitchingClinic);
  const switchingClinicName = useAuthUiStore((s) => s.switchingClinicName);
  const isBootstrappingSession = useAuthUiStore((s) => s.isBootstrappingSession);
  const endSessionBootstrap = useAuthUiStore((s) => s.endSessionBootstrap);

  useEffect(() => {
    if (!isBootstrappingSession || !auth) return;
    endSessionBootstrap();
  }, [isBootstrappingSession, auth, endSessionBootstrap]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative dark:bg-app-wash">
        <PlanOverLimitBanner />
        <AppHeader />
        <div className="relative z-0 flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>

      {isSwitchingClinic ? (
        <LoadingScreen
          message={
            switchingClinicName
              ? `Trocando para ${switchingClinicName}…`
              : "Trocando de clínica…"
          }
          description="Aguarde enquanto preparamos o ambiente da nova clínica."
        />
      ) : null}
    </SidebarProvider>
  );
}
