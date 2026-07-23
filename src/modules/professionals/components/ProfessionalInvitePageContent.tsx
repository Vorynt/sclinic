"use client"

import { useSearchParams } from "next/navigation"

import { ProfessionalInviteOnboarding } from "@/modules/professionals/components/ProfessionalInviteOnboarding"

export function ProfessionalInvitePageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""

  if (!token) {
    return (
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Convite inválido
        </h1>
        <p className="text-sm text-muted-foreground">
          Este link está incompleto. Peça um novo convite à clínica.
        </p>
      </div>
    )
  }

  return <ProfessionalInviteOnboarding token={token} />
}
