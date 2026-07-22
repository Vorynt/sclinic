"use client"

import { EnvelopeSimpleIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useResendVerificationEmailMutation } from "@/modules/authentication/hooks/use-auth"
import { ErrorCode, getClientMessage } from "@/shared/errors"

const RESEND_COOLDOWN_SECONDS = 60

type VerifyEmailBlockProps = {
  email: string
}

export function VerifyEmailBlock({ email }: VerifyEmailBlockProps) {
  const [cooldown, setCooldown] = useState(0)

  const resend = useResendVerificationEmailMutation({
    onSuccess: () => {
      toast.success("E-mail de verificação reenviado")
      setCooldown(RESEND_COOLDOWN_SECONDS)
    },
    onError: (error) => {
      toast.error(error.message || getClientMessage(ErrorCode.EMAIL_SEND_FAILED))
    },
  })

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldown])

  const isCoolingDown = cooldown > 0
  const isPending = resend.isPending

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <EnvelopeSimpleIcon className="size-6" weight="duotone" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Verifique seu e-mail
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para{" "}
            <span className="font-medium text-foreground">{email}</span>. Abra
            o e-mail e clique no link para liberar o acesso.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isPending || isCoolingDown}
          onClick={() => resend.mutate()}>
          {isPending ? (
            <>
              <Spinner />
              Reenviando…
            </>
          ) : isCoolingDown ? (
            `Reenviar em ${cooldown}s`
          ) : (
            "Reenviar e-mail"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Não encontrou? Confira a pasta de spam ou lixo eletrônico.
        </p>
      </div>
    </div>
  )
}
