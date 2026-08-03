import {
  LockKeyIcon,
  PulseIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { BecomePartnerButton } from "./BecomePartnerButton";
import { LogOutButton } from "./LogOutButton";

type AuthShellProps = {
  children: ReactNode;
  /** Wider content panel (e.g. plan picker). */
  wide?: boolean;
};

const TRUST_POINTS = [
  {
    icon: ShieldCheckIcon,
    title: "Acesso controlado",
    description: "Papéis e permissões alinhados ao fluxo da clínica.",
  },
  {
    icon: LockKeyIcon,
    title: "Dados sob governança",
    description: "Informações clínicas organizadas e protegidas.",
  },
  {
    icon: StethoscopeIcon,
    title: "Operação profissional",
    description: "Do agendamento ao atendimento, sem improvisos.",
  },
] as const;

export function AuthShell({ children, wide = false }: AuthShellProps) {
  return (
    <div className="grid h-svh overflow-hidden bg-background lg:grid-cols-2">
      <aside
        aria-label="Sobre o sclinic"
        className="relative hidden h-full overflow-hidden bg-[oklch(0.22_0.03_245)] text-white lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,color-mix(in_oklch,var(--primary)_42%,transparent),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_88%,color-mix(in_oklch,var(--chart-3)_22%,transparent),transparent_48%)]" />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at 35% 25%, black 18%, transparent 72%)",
            }}
          />
          <div className="animate-auth-orb absolute -top-24 -left-16 size-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="animate-auth-orb-alt absolute right-[-12%] bottom-[-10%] size-80 rounded-full bg-chart-2/25 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-10 py-10 xl:px-14 xl:py-12">
          <Link
            href={routes.landing}
            className="group inline-flex w-fit shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_50%,transparent),0_10px_24px_-10px_var(--primary)] transition-transform duration-300 group-hover:scale-[1.03]">
              <PulseIcon className="size-4" weight="bold" aria-hidden="true" />
            </span>
            <span className="font-heading text-xl font-semibold tracking-tight text-white">
              sclinic
            </span>
          </Link>

          <div className="animate-auth-fade-up flex min-h-0 flex-1 flex-col justify-center gap-10 py-12">
            <div className="flex max-w-md flex-col gap-4">
              <p className="text-[0.7rem] font-medium tracking-[0.18em] text-white/50 uppercase">
                Software clínico
              </p>
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance text-white xl:text-[2.65rem] xl:leading-[1.12]">
                Gestão séria para clínicas que não improvisam.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-white/65">
                Controle de acesso, dados organizados e operação pensada para o
                dia a dia de consultórios e clínicas.
              </p>
            </div>

            <ul className="flex max-w-md flex-col gap-4 border-t border-white/10 pt-8">
              {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                    <Icon
                      className="size-4 text-white/85"
                      weight="duotone"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white">
                      {title}
                    </span>
                    <span className="text-sm leading-relaxed text-white/55">
                      {description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="shrink-0 text-xs tracking-wide text-white/40">
            © {new Date().getFullYear()} sclinic · Vorynt
          </p>
        </div>
      </aside>

      <div className="relative flex h-full min-h-0 flex-col border-border lg:border-l">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]" />
        </div>

        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-5 md:px-10">
          <Link
            href={routes.landing}
            className="group inline-flex items-center gap-2.5 lg:invisible lg:pointer-events-none">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PulseIcon className="size-4" weight="bold" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              sclinic
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <BecomePartnerButton />
            <LogOutButton />
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div
              className={
                wide
                  ? "animate-auth-fade-up m-auto w-full max-w-3xl px-6 py-8 md:px-10"
                  : "animate-auth-fade-up m-auto w-full max-w-[24rem] px-6 py-8 md:px-10"
              }>
              {children}
            </div>
          </div>
        </main>

        <footer className="relative z-10 shrink-0 px-6 py-5 md:px-10 lg:hidden">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} sclinic · Vorynt
          </p>
        </footer>
      </div>
    </div>
  );
}
