"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuth } from "@/providers/AuthProvider";

export const BecomePartnerButton = () => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (isAuthenticated) return null;

  const isSignUp = pathname === routes.signUp;

  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <Link href={isSignUp ? routes.login : routes.signUp}>
        {isSignUp ? "Entrar" : "Criar conta"}
        <ArrowUpRightIcon className="size-3.5 opacity-70" aria-hidden="true" />
      </Link>
    </Button>
  );
};
