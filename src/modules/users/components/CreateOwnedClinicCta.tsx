import { BuildingsIcon } from "@phosphor-icons/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

type CreateOwnedClinicCtaProps = {
  /** Stronger CTA when the account has no clinic at all. */
  emphasis?: "default" | "primary"
}

/**
 * Soft entry to owner onboarding for users who are only members (or have none).
 * Lives in account shell — does not interrupt clinic operational screens.
 */
export function CreateOwnedClinicCta({
  emphasis = "default",
}: CreateOwnedClinicCtaProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border/60">
          <BuildingsIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Quer ter a sua própria clínica?
          </p>
          <p className="text-xs text-muted-foreground">
            Escolha um plano e cadastre sua clínica no sclinic. Seu acesso às
            clínicas em que você é convidado continua igual.
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant={emphasis === "primary" ? "default" : "outline"}
        className="self-start"
      >
        <Link href={`${routes.onboardingPlan}?intent=create-clinic`}>
          Criar minha clínica
        </Link>
      </Button>
    </div>
  )
}
