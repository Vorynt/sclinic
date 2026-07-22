"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useAcceptInvitationMutation } from "@/modules/users/hooks/use-user-mutations"
import { useAuth } from "@/providers/AuthProvider"

type AcceptInviteBlockProps = {
  token: string
}

export function AcceptInviteBlock({ token }: AcceptInviteBlockProps) {
  const router = useRouter()
  const { auth, isLoading, isAuthenticated } = useAuth()
  const started = useRef(false)

  const { mutate, isPending, isError } = useAcceptInvitationMutation({
    onSuccess: () => {
      toast.success("Convite aceito")
      router.replace(routes.dashboard)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const invitePath = `${routes.invite}?token=${token}`
  const loginHref = `${routes.login}?next=${encodeURIComponent(invitePath)}`
  const signUpHref = `${routes.signUp}?next=${encodeURIComponent(invitePath)}`

  useEffect(() => {
    if (isLoading || started.current) return

    if (!isAuthenticated || !auth) {
      return
    }

    if (auth.user.mustChangePassword) {
      router.replace(
        `${routes.changePassword}?next=${encodeURIComponent(invitePath)}`,
      )
      return
    }

    started.current = true
    mutate({ token })
  }, [auth, invitePath, isAuthenticated, isLoading, mutate, router, token])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Verificando sua sessão…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Convite para a clínica
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com o e-mail do convite e a senha provisória que a clínica
            definiu para você.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild>
            <a href={loginHref}>Entrar</a>
          </Button>
          <Button asChild variant="outline">
            <a href={signUpHref}>Não tenho senha ainda</a>
          </Button>
        </div>
      </div>
    )
  }

  if (auth?.user.mustChangePassword) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">
          Redirecionando para alterar a senha…
        </p>
      </div>
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
