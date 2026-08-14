import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { TwoFactorForm } from "@/modules/authentication/components/TwoFactorForm";
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";

export const metadata: Metadata = {
  title: "Autenticação em duas etapas",
  description: "Confirme o código do autenticador para entrar no sclinic",
};

type TwoFactorPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function TwoFactorPage({
  searchParams,
}: TwoFactorPageProps) {
  const session = await getCachedSession();
  if (session) {
    const { next } = await searchParams;
    redirect(getPostAuthRedirect(session, next));
  }

  return (
    <Suspense fallback={null}>
      <TwoFactorForm />
    </Suspense>
  );
}
