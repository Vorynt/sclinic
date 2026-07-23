"use client"

import {
  BuildingsIcon,
  CaretUpDownIcon,
  CheckIcon,
} from "@phosphor-icons/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useTransition } from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { routes } from "@/config/routes"
import {
  useAuthMemberships,
  useSwitchClinicMutation,
} from "@/modules/authentication/hooks/use-auth"
import { useClinic } from "@/modules/clinics/hooks/use-clinic"
import { canAccessPath } from "@/modules/dashboard/constants/nav"
import { useAuth } from "@/providers/AuthProvider"
import { getClientMessage } from "@/shared/errors"
import { useAuthUiStore } from "@/stores/auth.store"

export function ClinicIndicator() {
  const router = useRouter()
  const pathname = usePathname()
  const { auth } = useAuth()
  const { isMobile } = useSidebar()
  const activeClinicId = auth?.session.activeClinicId ?? null
  const roleName = auth?.membership?.roleName
  const { data: clinic, isLoading: clinicLoading } = useClinic(activeClinicId)
  const { data: memberships = [], isLoading: membershipsLoading } =
    useAuthMemberships()

  const canSwitch = memberships.length > 1

  const switcherOpen = useAuthUiStore((s) => s.clinicSwitcherOpen)
  const setSwitcherOpen = useAuthUiStore((s) => s.setClinicSwitcherOpen)
  const beginClinicSwitch = useAuthUiStore((s) => s.beginClinicSwitch)
  const endClinicSwitch = useAuthUiStore((s) => s.endClinicSwitch)

  const [isNavPending, startTransition] = useTransition()
  const awaitingNavRef = useRef(false)

  const switchClinic = useSwitchClinicMutation({
    onSuccess: (nextAuth) => {
      awaitingNavRef.current = true
      startTransition(() => {
        if (!canAccessPath(pathname, nextAuth.permissions)) {
          router.push(routes.home)
        } else {
          router.refresh()
        }
      })
    },
    onError: (error) => {
      awaitingNavRef.current = false
      endClinicSwitch()
      toast.error(getClientMessage(error.code))
    },
  })

  useEffect(() => {
    if (!awaitingNavRef.current || isNavPending) return

    awaitingNavRef.current = false
    endClinicSwitch()
    toast.success("Clínica alterada")
  }, [isNavPending, endClinicSwitch])

  if (clinicLoading || membershipsLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Skeleton className="h-12 w-full rounded-lg" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const label = clinic?.name ?? "Clínica"
  const roleLabel = roleName ?? "—"

  const content = (
    <>
      <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
        <BuildingsIcon className="size-4" aria-hidden />
      </span>
      <span className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{label}</span>
        <span className="truncate text-xs text-sidebar-foreground/70">
          {roleLabel}
        </span>
      </span>
      {canSwitch ? (
        <CaretUpDownIcon className="ml-auto size-4 opacity-60" aria-hidden />
      ) : null}
    </>
  )

  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none" tooltip={label}>
            {content}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={label}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Selecionar clínica"
            >
              {content}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel>Suas clínicas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {memberships.map((membership) => {
              const name = membership.clinicName ?? "Clínica"
              const isActive = membership.clinicId === activeClinicId
              const isSuspended = membership.status === "suspended"

              return (
                <DropdownMenuItem
                  key={membership.id}
                  disabled={isActive || isSuspended || switchClinic.isPending}
                  onSelect={() => {
                    if (isSuspended) return
                    beginClinicSwitch(name)
                    switchClinic.mutate({ clinicId: membership.clinicId })
                  }}
                  className="flex items-start justify-between gap-2"
                  title={
                    isSuspended
                      ? "Seu acesso a esta clínica está suspenso"
                      : undefined
                  }
                >
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
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
