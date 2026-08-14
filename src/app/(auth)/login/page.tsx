import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignInForm } from "@/modules/authentication/components/SignInForm";
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no sclinic",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCachedSession();
  if (session) {
    const { next } = await searchParams;
    redirect(getPostAuthRedirect(session, next));
  }

  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
