"use client";

import { AppTopNav } from "@/modules/dashboard/components/AppTopNav";
import { ClinicIndicator } from "@/modules/dashboard/components/ClinicIndicator";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import type { ShellNav } from "@/modules/dashboard/constants/nav";

type AppHeaderProps = {
  nav: ShellNav;
};

export function AppHeader({ nav }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
      <div className="flex h-14 items-center gap-3 px-3 md:gap-4 md:px-4">
        <ClinicIndicator />

        <div
          className="hidden h-5 w-px shrink-0 bg-border/80 md:block"
          aria-hidden
        />

        <AppTopNav nav={nav} />

        <div className="ml-auto shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}