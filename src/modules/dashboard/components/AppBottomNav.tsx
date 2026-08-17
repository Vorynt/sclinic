"use client";

import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { MoreNavSheet } from "@/modules/dashboard/components/MoreNavSheet";
import {
  hasOverflowNav,
  isNavActive,
  NAV_TOUR_TARGET,
  NAV_TOUR_TARGET_BY_HREF,
  type ShellNav,
} from "@/modules/dashboard/constants/nav";

type AppBottomNavProps = {
  nav: ShellNav;
};

export function AppBottomNav({ nav }: AppBottomNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = hasOverflowNav(nav);

  const overflowActive =
    showMore &&
    (nav.groups.some((group) =>
      group.items.some((item) => isNavActive(pathname, item.href)),
    ) ||
      nav.secondary.some((item) => isNavActive(pathname, item.href)));

  return (
    <>
      <nav
        className="z-20 shrink-0 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-backdrop-filter:bg-background/75 md:hidden"
        aria-label="Navegação principal"
      >
        <ul className="grid h-14 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {nav.primary.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            const shortTitle =
              item.title === "Agendamentos" ? "Agenda" : item.title;

            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  data-tour={NAV_TOUR_TARGET_BY_HREF[item.href]}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className="size-5"
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                  />
                  <span className="truncate">{shortTitle}</span>
                </Link>
              </li>
            );
          })}
          {showMore ? (
            <li className="min-w-0">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                data-tour={NAV_TOUR_TARGET.overflow}
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium",
                  overflowActive || moreOpen
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Mais módulos"
              >
                <DotsThreeOutlineIcon
                  className="size-5"
                  weight={overflowActive || moreOpen ? "fill" : "regular"}
                  aria-hidden
                />
                <span>Mais</span>
              </button>
            </li>
          ) : null}
        </ul>
      </nav>

      {showMore ? (
        <MoreNavSheet nav={nav} open={moreOpen} onOpenChange={setMoreOpen} />
      ) : null}
    </>
  );
}
