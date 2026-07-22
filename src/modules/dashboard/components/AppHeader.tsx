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
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import { getPageMeta } from "@/modules/dashboard/constants/nav";

export function AppHeader() {
  const pathname = usePathname();
  const { title, breadcrumbs } = getPageMeta(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h1 className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList className="text-xs">
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
      </div>

      <UserMenu />
    </header>
  );
}
