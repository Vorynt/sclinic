"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { AccountProfileForm } from "@/modules/users/components/AccountProfileForm"
import { useAccountProfile } from "@/modules/users/hooks/use-account"

export function AccountProfilePanel() {
  const {
    data: profile,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useAccountProfile()

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
      <QueryErrorState
        description="Não foi possível carregar o perfil."
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  return <AccountProfileForm profile={profile} />
}
