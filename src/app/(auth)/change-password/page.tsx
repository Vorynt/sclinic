import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { ForcedChangePasswordForm } from "@/modules/authentication/components/ForcedChangePasswordForm";
import { authService } from "@/modules/authentication/services/auth.service";
import { getPostAuthRedirect } from "@/modules/authentication/utils/post-auth-redirect";
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context";

export const metadata: Metadata = {
  title: "Alterar senha",
  description: "Defina uma nova senha para continuar",
};

export default async function ChangePasswordPage() {
  const session = await authService.getSession(await getAuthRequestContext());

  if (!session) {
    redirect(routes.login);
  }

  if (!session.user.emailVerified) {
    redirect(routes.verifyEmail);
  }

  if (!session.user.mustChangePassword) {
    redirect(getPostAuthRedirect(session));
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Spinner className="size-6" />
        </div>
      }>
      <ForcedChangePasswordForm />
    </Suspense>
  );
}
