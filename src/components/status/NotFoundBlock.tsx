import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

type NotFoundBlockProps = {
  /** Override the default title. */
  title?: string
  /** Override the default description. */
  description?: string
}

export function NotFoundBlock({
  title = "Página não encontrada",
  description = "O endereço que você tentou abrir não existe ou foi movido. Verifique o link ou volte para o início.",
}: NotFoundBlockProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MagnifyingGlassIcon
              className="size-6"
              weight="duotone"
              aria-hidden
            />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">404</p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href={routes.home}>Ir para o início</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
