import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignUpForm } from "@/modules/authentication/components/SignUpForm";
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";

export const metadata: Metadata = {
  title: "Cadastro",
  description: "Crie sua conta no sclinic",
};

export default async function SignUpPage() {
  const session = await getCachedSession();
  if (session) {
    redirect(getPostAuthRedirect(session));
  }

  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
