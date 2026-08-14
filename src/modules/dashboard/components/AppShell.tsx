"use client";

import { useEffect, type ReactNode } from "react";

import { PageActionsFab } from "@/components/layout/PageActionsFab";
import { LoadingScreen } from "@/components/status/LoadingScreen";
import { cn } from "@/lib/utils";
import { TwoFactorNudgeDialog } from "@/modules/authentication/components/TwoFactorNudgeDialog";
import { PlanOverLimitBanner } from "@/modules/billing/components/PlanOverLimitBanner";
import { AppBottomNav } from "@/modules/dashboard/components/AppBottomNav";
import { AppHeader } from "@/modules/dashboard/components/AppHeader";
import { getVisibleShellNav } from "@/modules/dashboard/constants/nav";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthUiStore } from "@/stores/auth.store";
import { usePageActionsStore } from "@/stores/page-actions.store";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { auth, canAny } = useAuth();
  const isSwitchingClinic = useAuthUiStore((s) => s.isSwitchingClinic);
  const switchingClinicName = useAuthUiStore((s) => s.switchingClinicName);
  const isBootstrappingSession = useAuthUiStore((s) => s.isBootstrappingSession);
  const endSessionBootstrap = useAuthUiStore((s) => s.endSessionBootstrap);
  const hasPageActions = usePageActionsStore((s) => s.actions.length > 0);

  const nav = getVisibleShellNav(canAny);

  useEffect(() => {
    if (!isBootstrappingSession || !auth) return;
    endSessionBootstrap();
  }, [isBootstrappingSession, auth, endSessionBootstrap]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden dark:bg-app-wash">
      <PlanOverLimitBanner />
      <AppHeader nav={nav} />
      <div
        className={cn(
          "relative z-0 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6",
          hasPageActions && "max-md:pb-24",
        )}
      >
        {children}
      </div>
      <AppBottomNav nav={nav} />
      <PageActionsFab />
      <TwoFactorNudgeDialog />

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
    </div>
  );
}
