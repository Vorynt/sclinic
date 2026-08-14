"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { BackupCodesDialog } from "@/modules/authentication/components/BackupCodesDialog"
import { ConfirmPasswordDialog } from "@/modules/authentication/components/ConfirmPasswordDialog"
import { TwoFactorEnrollmentDialog } from "@/modules/authentication/components/TwoFactorEnrollmentDialog"
import {
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useRegenerateBackupCodesMutation,
} from "@/modules/authentication/hooks/use-auth"
import type { TwoFactorEnableResult } from "@/modules/authentication/types/auth"
import { useAuth } from "@/providers/AuthProvider"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

function passwordError(error: unknown): { message: string; code: string } {
  if (isAppError(error)) {
    return { message: getClientMessage(error.code), code: error.code }
  }
  return {
    message: getClientMessage(ErrorCode.INTERNAL_ERROR),
    code: ErrorCode.INTERNAL_ERROR,
  }
}

export function TwoFactorSetupPanel() {
  const { auth } = useAuth()
  const enabled = Boolean(auth?.user.twoFactorEnabled)

  return (
    <section className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Autenticação em duas etapas
        </h3>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "Sua conta exige um código do autenticador a cada login."
            : "Proteja o acesso com um app autenticador e códigos de backup."}
        </p>
      </div>

      {enabled ? <EnabledTwoFactor /> : <EnableTwoFactorAction />}
    </section>
  )
}

function EnableTwoFactorAction() {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [enrollment, setEnrollment] = useState<TwoFactorEnableResult | null>(
    null,
  )
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const enable = useEnableTwoFactorMutation({
    onSuccess: (data) => {
      setFormError(null)
      setPasswordOpen(false)
      requestAnimationFrame(() => setEnrollment(data))
    },
    onError: (error) => setFormError(passwordError(error)),
  })

  return (
    <>
      <Button type="button" className="w-fit" onClick={() => setPasswordOpen(true)}>
        Ativar 2FA
      </Button>
      <ConfirmPasswordDialog
        open={passwordOpen}
        onOpenChange={(next) => {
          setPasswordOpen(next)
          if (!next) setFormError(null)
        }}
        title="Ativar autenticação em duas etapas"
        description="Confirme sua senha para gerar o QR do autenticador e os códigos de backup."
        confirmLabel="Continuar"
        isPending={enable.isPending}
        error={formError}
        onConfirm={(password) => enable.mutate({ password })}
      />
      <TwoFactorEnrollmentDialog
        open={enrollment !== null}
        enrollment={enrollment}
        onOpenChange={(next) => {
          if (!next) setEnrollment(null)
        }}
        onComplete={() => setEnrollment(null)}
      />
    </>
  )
}

function EnabledTwoFactor() {
  const [dialog, setDialog] = useState<"regenerate" | "disable" | null>(null)
  const [freshBackupCodes, setFreshBackupCodes] = useState<string[] | null>(
    null,
  )
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const disable = useDisableTwoFactorMutation({
    onSuccess: () => {
      toast.success("2FA desativado")
      setDialog(null)
      setFormError(null)
      setFreshBackupCodes(null)
    },
    onError: (error) => setFormError(passwordError(error)),
  })

  const regenerate = useRegenerateBackupCodesMutation({
    onSuccess: (data) => {
      toast.success("Novos códigos de backup gerados")
      setDialog(null)
      setFormError(null)
      requestAnimationFrame(() => setFreshBackupCodes(data.backupCodes))
    },
    onError: (error) => setFormError(passwordError(error)),
  })

  const isPending = disable.isPending || regenerate.isPending

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormError(null)
            setDialog("regenerate")
          }}
        >
          Gerar novos códigos
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setFormError(null)
            setDialog("disable")
          }}
        >
          Desativar 2FA
        </Button>
      </div>

      <ConfirmPasswordDialog
        open={dialog === "regenerate"}
        onOpenChange={(next) => {
          if (!next) {
            setDialog(null)
            setFormError(null)
          }
        }}
        title="Gerar novos códigos de backup"
        description="Os códigos atuais deixam de valer. Confirme sua senha para gerar uma lista nova."
        confirmLabel="Gerar códigos"
        isPending={isPending}
        error={formError}
        onConfirm={(password) => regenerate.mutate({ password })}
      />

      <ConfirmPasswordDialog
        open={dialog === "disable"}
        onOpenChange={(next) => {
          if (!next) {
            setDialog(null)
            setFormError(null)
          }
        }}
        title="Desativar autenticação em duas etapas"
        description="Sua conta voltará a entrar só com e-mail e senha. Confirme sua senha para continuar."
        confirmLabel="Desativar 2FA"
        confirmVariant="destructive"
        isPending={isPending}
        error={formError}
        onConfirm={(password) => disable.mutate({ password })}
      />

      <BackupCodesDialog
        open={freshBackupCodes !== null}
        codes={freshBackupCodes ?? []}
        title="Novos códigos de backup"
        description="Os códigos anteriores deixaram de valer. Guarde estes em um lugar seguro — eles não aparecem de novo."
        onOpenChange={(next) => {
          if (!next) setFreshBackupCodes(null)
        }}
      />
    </>
  )
}
