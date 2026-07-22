import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { routes } from "@/config/routes"

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link
          href={routes.home}
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          sclinic
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.signUp}>Seja um parceiro</Link>
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>

      <footer className="flex items-center justify-center gap-3 px-6 py-5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <TextShimmer className="text-sm font-medium">Feito com</TextShimmer>
          <span aria-hidden="true">💙</span>
          <TextShimmer className="text-sm font-medium">by Vorynt</TextShimmer>
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span>© 2026</span>
      </footer>
    </div>
  )
}
