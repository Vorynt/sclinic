"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  isNavActive,
  type ShellNav,
} from "@/modules/dashboard/constants/nav";

type MoreNavSheetProps = {
  nav: ShellNav;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MoreNavSheet({ nav, open, onOpenChange }: MoreNavSheetProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0 rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="border-b border-border/70 pb-3 text-left">
          <SheetTitle>Mais</SheetTitle>
        </SheetHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-4 py-4">
          {nav.groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/60",
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
          {nav.secondary.length > 0 ? (
            <div className="flex flex-col gap-1">
              {nav.groups.length > 0 ? (
                <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Conta e suporte
                </p>
              ) : null}
              {nav.secondary.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/60",
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
