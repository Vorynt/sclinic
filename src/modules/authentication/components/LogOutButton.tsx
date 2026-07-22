"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { SignOutIcon } from "@phosphor-icons/react";
import { useSignOutMutation } from "../hooks/use-auth";

export const LogOutButton = () => {
  const signOut = useSignOutMutation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => signOut.mutate()}>
      <SignOutIcon />
      Sair
    </Button>
  );
};
