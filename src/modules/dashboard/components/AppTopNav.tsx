"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { OverflowNavMenu } from "@/modules/dashboard/components/OverflowNavMenu";
import {
  isNavActive,
  type ShellNav,
} from "@/modules/dashboard/constants/nav";

type AppTopNavProps = {
  nav: ShellNav;
  className?: string;
};

export function AppTopNav({ nav, className }: AppTopNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "hidden min-w-0 flex-1 items-center gap-0.5 md:flex",
        className,
      )}
      aria-label="Navegação principal"
    >
      {nav.primary.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
      <OverflowNavMenu nav={nav} />
    </nav>
  );
}
