"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getAttendanceNavItems } from "@/modules/appointments/constants/attendance-nav";

type AttendanceNavProps = {
  appointmentId: string;
};

export function AttendanceNav({ appointmentId }: AttendanceNavProps) {
  const pathname = usePathname();
  const items = getAttendanceNavItems(appointmentId);

  return (
    <nav
      aria-label="Seções do atendimento"
      className="sticky top-20 flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          item.match === "exact"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}>
            <span className="block">{item.title}</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
