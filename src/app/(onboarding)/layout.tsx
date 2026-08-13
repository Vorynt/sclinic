import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import { AuthShell } from "@/modules/authentication/components/AuthShell";
import { getCachedSession } from "@/modules/authentication/utils/get-cached-session";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCachedSession();

  if (session?.user.mustChangePassword) {
    redirect(routes.changePassword);
  }

  return <AuthShell wide>{children}</AuthShell>;
}
