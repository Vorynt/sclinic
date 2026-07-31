import { ArrowLeftIcon, PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { routes } from "@/config/routes"

type AccountShellProps = {
  children: ReactNode
  /** Defaults to dashboard home; use select-clinic when product access is blocked. */
  backHref?: string
}

/**
 * Clinic-agnostic chrome for /account — no AppShell sidebar.
 */
export function AccountShell({
  children,
  backHref = routes.home,
}: AccountShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href={backHref}>
                <ArrowLeftIcon />
                Voltar
              </Link>
            </Button>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <Link
              href={routes.account}
              className="hidden items-center gap-2 sm:inline-flex"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <PulseIcon className="size-3.5" weight="bold" aria-hidden />
              </span>
              <span className="font-heading text-sm font-semibold tracking-tight">
                Minha conta
              </span>
            </Link>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  )
}
