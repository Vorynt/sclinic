"use client";

import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  hasOverflowNav,
  isNavActive,
  NAV_TOUR_TARGET,
  type ShellNav,
} from "@/modules/dashboard/constants/nav";

type OverflowNavMenuProps = {
  nav: ShellNav;
  className?: string;
};

export function OverflowNavMenu({ nav, className }: OverflowNavMenuProps) {
  const pathname = usePathname();

  if (!hasOverflowNav(nav)) return null;

  const overflowActive =
    nav.groups.some((group) =>
      group.items.some((item) => isNavActive(pathname, item.href)),
    ) || nav.secondary.some((item) => isNavActive(pathname, item.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-tour={NAV_TOUR_TARGET.overflow}
          className={cn(
            "h-9 gap-1.5 px-3 text-muted-foreground",
            overflowActive && "bg-accent text-accent-foreground",
            className,
          )}
          aria-label="Mais módulos"
        >
          <DotsThreeOutlineIcon className="size-4" weight="bold" aria-hidden />
          <span>Mais</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" sideOffset={6}>
        {nav.groups.map((group, index) => (
          <DropdownMenuGroup key={group.id}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      isNavActive(pathname, item.href) && "bg-accent",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
        {nav.secondary.length > 0 ? (
          <>
            {nav.groups.length > 0 ? <DropdownMenuSeparator /> : null}
            {nav.secondary.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      isNavActive(pathname, item.href) && "bg-accent",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
