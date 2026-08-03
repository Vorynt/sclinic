"use client";

import { SignOutIcon, UserIcon } from "@phosphor-icons/react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { useSignOutMutation } from "@/modules/authentication/hooks/use-auth";
import { useAuth } from "@/providers/AuthProvider";
import { getClientMessage } from "@/shared/errors";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const { auth } = useAuth();
  const user = auth?.user;

  const signOut = useSignOutMutation({
    onSuccess: () => {
      router.push(routes.login);
      router.refresh();
    },
    onError: (error) => {
      toast.error(getClientMessage(error.code));
    },
  });

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className=" gap-2 rounded-none px-2 py-1.5 h-auto"
          aria-label="Menu da conta">
          <span className="hidden min-w-0 text-right leading-tight sm:block">
            <span className="block max-w-40 truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="block max-w-40 truncate text-xs text-muted-foreground">
              {user.email}
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

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signOut.isPending}
          onSelect={() => {
            signOut.mutate();
          }}>
          <SignOutIcon />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
