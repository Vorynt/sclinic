"use client";

import {
  BuildingsIcon,
  CaretUpDownIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import {
  useAuthMemberships,
  useSwitchClinicMutation,
} from "@/modules/authentication/hooks/use-auth";
import { useClinic } from "@/modules/clinics/hooks/use-clinic";
import { canAccessPath, NAV_TOUR_TARGET } from "@/modules/dashboard/constants/nav";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthUiStore } from "@/stores/auth.store";

export function ClinicIndicator() {
  const router = useRouter();
  const pathname = usePathname();
  const { auth } = useAuth();
  const activeClinicId = auth?.session.activeClinicId ?? null;
  const roleName = auth?.membership?.roleName;
  const { data: clinic, isLoading: clinicLoading } = useClinic(activeClinicId);
  const { data: memberships = [], isLoading: membershipsLoading } =
    useAuthMemberships();

  const canSwitch = memberships.length > 1;

  const switcherOpen = useAuthUiStore((s) => s.clinicSwitcherOpen);
  const setSwitcherOpen = useAuthUiStore((s) => s.setClinicSwitcherOpen);
  const beginClinicSwitch = useAuthUiStore((s) => s.beginClinicSwitch);
  const endClinicSwitch = useAuthUiStore((s) => s.endClinicSwitch);

  const [isNavPending, startTransition] = useTransition();
  const awaitingNavRef = useRef(false);

  const switchClinic = useSwitchClinicMutation({
    onSuccess: (nextAuth) => {
      awaitingNavRef.current = true;
      startTransition(() => {
        if (!canAccessPath(pathname, nextAuth.permissions)) {
          router.push(routes.home);
        } else {
          router.refresh();
        }
      });
    },
    onError: (error) => {
      awaitingNavRef.current = false;
      endClinicSwitch();
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!awaitingNavRef.current || isNavPending) return;

    awaitingNavRef.current = false;
    endClinicSwitch();
    toast.success("Clínica alterada");
  }, [isNavPending, endClinicSwitch]);

  if (clinicLoading || membershipsLoading) {
    return <Skeleton className="h-9 w-36 rounded-md" />;
  }

  const label = clinic?.name ?? "Clínica";
  const roleLabel = roleName ?? "—";

  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <BuildingsIcon className="size-3.5" weight="bold" aria-hidden />
      </span>
      <span className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">
          {roleLabel}
        </span>
      </span>
      {canSwitch ? (
        <span className="flex items-center transition-colors justify-center size-7 shrink-0 rounded-md group-hover/clinic-indicator-trigger:bg-primary/10">
          <CaretUpDownIcon
            className="size-3.5 shrink-0 opacity-60"
            aria-hidden
          />
        </span>
      ) : null}
    </>
  );

  if (!canSwitch) {
    return (
      <div
        data-tour={NAV_TOUR_TARGET.clinic}
        className="flex max-w-44 items-center gap-2 sm:max-w-52"
        title={`${label} · ${roleLabel}`}>
        {content}
      </div>
    );
  }

  return (
    <DropdownMenu open={switcherOpen} onOpenChange={setSwitcherOpen}>
      <DropdownMenuTrigger
        aria-label="Selecionar clínica"
        data-tour={NAV_TOUR_TARGET.clinic}
        className="group/clinic-indicator-trigger flex max-w-44 items-center gap-2 sm:max-w-52  px-1.5 py-1 rounded-md transition-colors">
        {content}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start" sideOffset={6}>
        <DropdownMenuLabel>Suas clínicas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((membership) => {
          const name = membership.clinicName ?? "Clínica";
          const isActive = membership.clinicId === activeClinicId;
          const isSuspended = membership.status === "suspended";

          return (
            <DropdownMenuItem
              key={membership.id}
              disabled={isActive || isSuspended || switchClinic.isPending}
              onSelect={() => {
                if (isSuspended) return;
                beginClinicSwitch(name);
                switchClinic.mutate({ clinicId: membership.clinicId });
              }}
              className="flex items-start justify-between gap-2"
              title={
                isSuspended
                  ? "Seu acesso a esta clínica está suspenso"
                  : undefined
              }>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-medium">{name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {isSuspended ? "Suspenso" : membership.roleName}
                </span>
              </span>
              {isActive ? (
                <CheckIcon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
