"use client"

import { LockSimpleIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

type ForbiddenBlockProps = {
  /** Override the default title. */
  title?: string
  /** Override the default description. */
  description?: string
}

export function ForbiddenBlock({
  title = "Acesso negado",
  description = "Você não tem permissão para acessar esta página. Peça a um administrador para liberar o acesso, ou volte para uma área disponível.",
}: ForbiddenBlockProps) {
  const router = useRouter()

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <LockSimpleIcon className="size-6" weight="duotone" aria-hidden />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={routes.dashboard}>Ir para o início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
