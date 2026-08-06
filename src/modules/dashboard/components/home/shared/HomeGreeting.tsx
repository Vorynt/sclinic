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
    <header className="flex flex-col gap-1.5">
      <p className="text-[0.7rem] font-medium tracking-[0.16em] text-primary/70 uppercase">
        {clinicName ?? "sclinic"}
      </p>
      <h1 className="animate-auth-fade-up font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
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
