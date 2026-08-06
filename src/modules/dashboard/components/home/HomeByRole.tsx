"use client"

import { AdminHome } from "@/modules/dashboard/components/home/AdminHome"
import { ClinicianHome } from "@/modules/dashboard/components/home/ClinicianHome"
import { DefaultHome } from "@/modules/dashboard/components/home/DefaultHome"
import { FinancialHome } from "@/modules/dashboard/components/home/FinancialHome"
import { ManagerHome } from "@/modules/dashboard/components/home/ManagerHome"
import { NurseHome } from "@/modules/dashboard/components/home/NurseHome"
import { OwnerHome } from "@/modules/dashboard/components/home/OwnerHome"
import { ReceptionistHome } from "@/modules/dashboard/components/home/ReceptionistHome"
import { useAuth } from "@/providers/AuthProvider"

const HOME_BY_ROLE = {
  owner: OwnerHome,
  admin: AdminHome,
  manager: ManagerHome,
  receptionist: ReceptionistHome,
  clinician: ClinicianHome,
  nurse: NurseHome,
  financial: FinancialHome,
} as const

type RoleKey = keyof typeof HOME_BY_ROLE

function isRoleKey(value: string): value is RoleKey {
  return value in HOME_BY_ROLE
}

export function HomeByRole() {
  const { auth, isLoading } = useAuth()
  const roleKey = auth?.membership?.roleKey

  if (isLoading && !auth) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  const Home =
    roleKey && isRoleKey(roleKey) ? HOME_BY_ROLE[roleKey] : DefaultHome

  return <Home />
}
