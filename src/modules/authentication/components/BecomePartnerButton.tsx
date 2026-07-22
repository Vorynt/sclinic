"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuth } from "@/providers/AuthProvider";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";

export const BecomePartnerButton = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <Link href={routes.signUp}>
        Seja um parceiro
        <ArrowUpRightIcon className="size-3.5 opacity-70" aria-hidden="true" />
      </Link>
    </Button>
  );
};
