"use client";

import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const THEMES = ["light", "dark", "system"] as const;
const THEME_LABELS = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-full rounded-none px-4!">
          <MoonIcon className={cn("h-4 w-4 hidden dark:block")} />
          <SunIcon className={cn("h-4 w-4 dark:hidden")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        {THEMES.map((theme) => (
          <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
            {THEME_LABELS[theme]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
