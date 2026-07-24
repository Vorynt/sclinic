"use client"

import { Spinner } from "@/components/ui/spinner"
import { AccountProfileForm } from "@/modules/users/components/AccountProfileForm"
import { useAccountProfile } from "@/modules/users/hooks/use-account"

export function AccountProfilePanel() {
  const { data: profile, isPending, isError } = useAccountProfile()

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Carregando perfil…
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar o perfil.
      </p>
    )
  }

  return <AccountProfileForm profile={profile} />
}
