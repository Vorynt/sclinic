"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import * as React from "react";

export function ThemeProvider({
  children,
  forcedTheme,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const printForcedTheme = pathname.endsWith("/print") ? "light" : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      forcedTheme={forcedTheme ?? printForcedTheme}
      {...props}>
      {children}
    </NextThemesProvider>
  );
}
