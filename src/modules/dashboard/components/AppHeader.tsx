"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import { getPageMeta } from "@/modules/dashboard/constants/nav";

export function AppHeader() {
  const pathname = usePathname();
  const { title, breadcrumbs } = getPageMeta(pathname);

  return (
    <header className="flex h-12 shrink-0 sticky top-0 z-10 bg-background items-center gap-2 border-b border-border/70 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1" />

      {/* Mobile: current page name (breadcrumb is hidden below sm) */}
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground sm:hidden">
        {title}
      </p>

      <Breadcrumb className="hidden min-w-0 flex-1 sm:block">
        <BreadcrumbList>
          {breadcrumbs.map((segment, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={`${segment.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {isLast || !segment.href ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex items-center h-full *:border-l *:border-l-border *:pl-2">
        <ThemeToggle />
        <UserMenu />
      </section>
    </header>
  );
}
