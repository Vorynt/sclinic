"use client"

import { BuildingsIcon, ProhibitIcon } from "@phosphor-icons/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

type SuspendedClinic = {
  id: string
  name: string
}

type MembershipInactiveBlockProps = {
  clinics: SuspendedClinic[]
}

export function MembershipInactiveBlock({
  clinics,
}: MembershipInactiveBlockProps) {
  const single = clinics.length === 1
  const clinicLabel = single
    ? clinics[0]?.name ?? "sua clínica"
    : "suas clínicas"

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ProhibitIcon className="size-6" weight="duotone" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Acesso suspenso
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu vínculo com {clinicLabel} está suspenso. Peça a um administrador
            para reativar o acesso, ou crie sua própria clínica no sclinic.
          </p>
        </div>
      </div>

      {clinics.length > 0 ? (
        <ul className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
          {clinics.map((clinic) => (
            <li
              key={clinic.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border/60">
                <BuildingsIcon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-foreground">
                  {clinic.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  Suspenso
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href={`${routes.onboardingPlan}?intent=create-clinic`}>
            Criar minha clínica
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Você será direcionado para escolher um plano e cadastrar a clínica.
        </p>
      </div>
    </div>
  )
}
