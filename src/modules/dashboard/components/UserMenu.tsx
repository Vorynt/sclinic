"use client";

import {
  MoonIcon,
  SignOutIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { useSignOutMutation } from "@/modules/authentication/hooks/use-auth";
import { NAV_TOUR_TARGET } from "@/modules/dashboard/constants/nav";
import { useAuth } from "@/providers/AuthProvider";

const THEMES = ["light", "dark", "system"] as const;
const THEME_LABELS = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
} as const;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const { auth } = useAuth();
  const { theme, setTheme } = useTheme();
  const user = auth?.user;

  const signOut = useSignOutMutation({
    onSuccess: () => {
      router.push(routes.login);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-tour={NAV_TOUR_TARGET.account}
          className="h-9 gap-2 rounded-md px-1.5 sm:px-2"
          aria-label="Menu da conta"
        >
          <span className="hidden min-w-0 text-right leading-tight lg:block">
            <span className="block max-w-36 truncate text-sm font-medium">
              {user.name}
            </span>
          </span>
          <Avatar size="sm">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}
            <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.accountOverview}>
            <UserIcon />
            Minha conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunIcon className="dark:hidden" />
            <MoonIcon className="hidden dark:inline" />
            Tema
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEMES.map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className={theme === value ? "bg-accent" : undefined}
              >
                {THEME_LABELS[value]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signOut.isPending}
          onSelect={() => {
            signOut.mutate();
          }}
        >
          <SignOutIcon />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
