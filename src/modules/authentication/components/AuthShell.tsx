import { PulseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { routes } from "@/config/routes";
import { BecomePartnerButton } from "./BecomePartnerButton";
import { LogOutButton } from "./LogOutButton";

type AuthShellProps = {
  children: ReactNode;
  /** Wider content panel (e.g. plan picker). */
  wide?: boolean;
};

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent_50%)]" />

        <div className="animate-auth-orb absolute -top-28 left-[12%] size-88 rounded-full bg-primary/20 blur-3xl" />
        <div className="animate-auth-orb-alt absolute top-[28%] -right-24 size-104 rounded-full bg-chart-1/30 blur-3xl" />
        <div className="animate-auth-orb absolute -bottom-32 left-[30%] size-96 rounded-full bg-chart-3/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/55">
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <Link
            href={routes.home}
            className="group inline-flex items-center gap-2.5">
            <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_40%,transparent),0_8px_20px_-8px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
              <PulseIcon className="size-4" weight="bold" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              sclinic
            </span>
          </Link>

          <BecomePartnerButton />
          <LogOutButton />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div
          className={
            wide
              ? "animate-auth-fade-up w-full max-w-fit rounded-2xl border border-border/70 bg-background/75 p-8 shadow-[0_24px_80px_-32px_color-mix(in_oklch,var(--foreground)_28%,transparent)] ring-1 ring-foreground/5 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
              : "animate-auth-fade-up w-full max-w-md rounded-2xl border border-border/70 bg-background/75 p-8 shadow-[0_24px_80px_-32px_color-mix(in_oklch,var(--foreground)_28%,transparent)] ring-1 ring-foreground/5 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          }>
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-center gap-3 px-6 py-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TextShimmer className="text-sm font-medium">Feito com</TextShimmer>
            <span aria-hidden="true">💙</span>
            <TextShimmer className="text-sm font-medium">by Vorynt</TextShimmer>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
