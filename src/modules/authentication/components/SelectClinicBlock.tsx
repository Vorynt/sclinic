"use client"

import {
  BuildingsIcon,
  CreditCardIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { useSwitchClinicMutation } from "@/modules/authentication/hooks/use-auth"
import { getSafeNextPath } from "@/modules/authentication/utils/post-auth-redirect"
import { getClientMessage } from "@/shared/errors"

type SelectableClinic = {
  clinicId: string
  name: string
  roleName: string
  status: "active" | "suspended"
  suspendReason?: "membership" | "subscription"
}

type BlockedClinic = {
  clinicId: string
  clinicName: string
  isOwner: boolean
}

type SelectClinicBlockProps = {
  clinics: SelectableClinic[]
  next?: string | null
  blockedClinic?: BlockedClinic | null
}

export function SelectClinicBlock({
  clinics,
  next,
  blockedClinic = null,
}: SelectClinicBlockProps) {
  const router = useRouter()
  const safeNext = getSafeNextPath(next)
  const [pendingClinicId, setPendingClinicId] = useState<string | null>(null)

  const switchClinic = useSwitchClinicMutation({
    onSuccess: () => {
      toast.success("Clínica selecionada")
      router.replace(safeNext ?? routes.home)
    },
    onError: (error) => {
      setPendingClinicId(null)
      toast.error(getClientMessage(error.code))
    },
  })

  const activeClinics = clinics.filter((clinic) => clinic.status === "active")
  const suspendedClinics = clinics.filter(
    (clinic) => clinic.status === "suspended",
  )

  const hasSelectable = activeClinics.length > 0

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BuildingsIcon className="size-6" weight="duotone" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Escolha a clínica
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasSelectable
              ? "Selecione com qual clínica deseja continuar."
              : "Nenhuma clínica disponível no momento."}
          </p>
        </div>
      </div>

      {blockedClinic ? (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Assinatura suspensa</AlertTitle>
          <AlertDescription>
            A clínica{" "}
            <span className="font-medium text-foreground">
              {blockedClinic.clinicName}
            </span>{" "}
            está com a assinatura suspensa
            {blockedClinic.isOwner
              ? ". Regularize para voltar a usar o sistema."
              : ". Peça ao proprietário para regularizar, ou escolha outra clínica."}
          </AlertDescription>
        </Alert>
      ) : null}

      {blockedClinic?.isOwner ? (
        <Button asChild size="lg" className="w-full">
          <Link href={`${routes.onboardingPlan}?intent=reactivate`}>
            <CreditCardIcon data-icon="inline-start" />
            Regularizar assinatura
          </Link>
        </Button>
      ) : null}

      {activeClinics.length > 0 || suspendedClinics.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {activeClinics.map((clinic) => {
            const isPending =
              switchClinic.isPending && pendingClinicId === clinic.clinicId

            return (
              <li key={clinic.clinicId}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                  disabled={switchClinic.isPending}
                  onClick={() => {
                    setPendingClinicId(clinic.clinicId)
                    switchClinic.mutate({ clinicId: clinic.clinicId })
                  }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {isPending ? (
                      <Spinner className="size-4" />
                    ) : (
                      <BuildingsIcon className="size-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {clinic.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {clinic.roleName}
                    </span>
                  </span>
                </Button>
              </li>
            )
          })}

          {suspendedClinics.map((clinic) => (
            <li key={clinic.clinicId}>
              <div
                className="flex h-auto w-full items-start gap-3 rounded-lg border border-border/70 px-3 py-3 text-left opacity-60"
                title={
                  clinic.suspendReason === "subscription"
                    ? "Assinatura suspensa"
                    : "Seu acesso a esta clínica está suspenso"
                }
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <BuildingsIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {clinic.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {clinic.suspendReason === "subscription"
                      ? "Assinatura suspensa"
                      : "Suspenso"}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
