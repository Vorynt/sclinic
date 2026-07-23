"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { SetInvitePasswordForm } from "@/modules/users/components/SetInvitePasswordForm"
import { useAcceptInvitationMutation } from "@/modules/users/hooks/use-user-mutations"
import { useInviteAccessQuery } from "@/modules/users/hooks/use-users"
import { useAuth } from "@/providers/AuthProvider"

type AcceptInviteBlockProps = {
  token: string
}

export function AcceptInviteBlock({ token }: AcceptInviteBlockProps) {
  const router = useRouter()
  const { auth, isLoading, isAuthenticated } = useAuth()
  const started = useRef(false)

  const accessQuery = useInviteAccessQuery(token)

  const { mutate, isPending, isError } = useAcceptInvitationMutation({
    onSuccess: () => {
      toast.success("Convite aceito")
      router.replace(routes.home)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const invitePath = `${routes.invite}?token=${token}`
  const loginHref = `${routes.login}?next=${encodeURIComponent(invitePath)}`

  useEffect(() => {
    if (isLoading || started.current) return

    if (!isAuthenticated || !auth) {
      return
    }

    if (auth.user.mustChangePassword) {
      return
    }

    started.current = true
    mutate({ token })
  }, [auth, isAuthenticated, isLoading, mutate, token])

  if (isLoading || accessQuery.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Verificando seu convite…</p>
      </div>
    )
  }

  if (accessQuery.isError || !accessQuery.data) {
    return (
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Convite inválido
        </h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível validar este convite. Peça um novo link à clínica.
        </p>
      </div>
    )
  }

  const access = accessQuery.data

  if (!isAuthenticated) {
    if (access.needsPasswordSetup) {
      return (
        <SetInvitePasswordForm
          token={token}
          email={access.email}
          clinicName={access.clinicName}
        />
      )
    }

    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Convite para a clínica
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com a conta <strong>{access.email}</strong> para aceitar o
            convite de <strong>{access.clinicName}</strong>.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild>
            <a href={loginHref}>Entrar</a>
          </Button>
        </div>
      </div>
    )
  }

  if (auth?.user.mustChangePassword) {
    if (
      access.email.toLowerCase() !== auth.user.email.toLowerCase()
    ) {
      return (
        <div className="flex max-w-sm flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Conta diferente
          </h1>
          <p className="text-sm text-muted-foreground">
            Este convite é para <strong>{access.email}</strong>. Saia da conta
            atual e abra o link novamente.
          </p>
        </div>
      )
    }

    return (
      <SetInvitePasswordForm
        token={token}
        email={access.email}
        clinicName={access.clinicName}
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {isPending || (!isError && auth) ? <Spinner className="size-6" /> : null}
      <p className="text-sm text-muted-foreground">
        {isError ? "Não foi possível aceitar o convite." : "Aceitando convite…"}
      </p>
      {isError ? (
        <Button
          type="button"
          onClick={() => {
            started.current = true
            mutate({ token })
          }}
        >
          Tentar novamente
        </Button>
      ) : null}
    </div>
  )
}
