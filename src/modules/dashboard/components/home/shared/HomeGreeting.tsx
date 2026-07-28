"use client"

import type { ReactNode } from "react"

import { getGreetingFirstName } from "@/modules/dashboard/utils/greeting-name"
import { getRoleLabel } from "@/modules/users/constants/users"
import { useAuth } from "@/providers/AuthProvider"

type HomeGreetingProps = {
  subtitle?: ReactNode
}

export function HomeGreeting({ subtitle }: HomeGreetingProps) {
  const { auth } = useAuth()
  const firstName = getGreetingFirstName(auth?.user.name)
  const roleKey = auth?.membership?.roleKey
  const roleLabel = roleKey
    ? getRoleLabel(roleKey, auth?.membership?.roleName)
    : null
  const clinicName = auth?.membership?.clinicName

  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Olá, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle ?? (
          <>
            {roleLabel ? `${roleLabel}` : "Bem-vindo"}
            {clinicName ? ` · ${clinicName}` : null}
          </>
        )}
      </p>
    </header>
  )
}
