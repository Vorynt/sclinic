import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/modules/authentication/components/ForgotPasswordForm";
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Recupere o acesso à sua conta",
};

export default async function ForgotPasswordPage() {
  const session = await getCachedSession();
  if (session) {
    redirect(getPostAuthRedirect(session));
  }

  return <ForgotPasswordForm />;
}
