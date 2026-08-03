import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { VerifyEmailBlock } from "@/modules/authentication/components/VerifyEmailBlock";
import { authService } from "@/modules/authentication/services/auth.service";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context";

export const metadata: Metadata = {
  title: "Verificar e-mail",
  description: "Confirme seu e-mail para continuar no sclinic",
};

export default async function VerifyEmailPage() {
  const session = await authService.getSession(await getAuthRequestContext());

  if (!session) {
    redirect(routes.login);
  }

  if (session.user.emailVerified) {
    redirect(getPostAuthRedirect(session));
  }

  return <VerifyEmailBlock email={session.user.email} />;
}
