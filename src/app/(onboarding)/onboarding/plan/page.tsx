import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { routes } from "@/config/routes";
import { authService } from "@/modules/authentication/services/auth.service";
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context";
import { PlanPicker } from "@/modules/billing/components/PlanPicker";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Escolher plano · sclinic",
};

type OnboardingPlanPageProps = {
  searchParams: Promise<{ intent?: string }>;
};

export default async function OnboardingPlanPage({
  searchParams,
}: OnboardingPlanPageProps) {
  const session = await authService.getSession(await getAuthRequestContext());

  if (!session) {
    redirect(routes.login);
  }

  if (!session.user.emailVerified) {
    redirect(routes.verifyEmail);
  }

  if (session.membership) {
    redirect(routes.home);
  }

  const { intent } = await searchParams;
  if (
    session.hasSuspendedMembershipOnly &&
    intent !== "create-clinic"
  ) {
    redirect(routes.membershipInactive);
  }

  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <PlanPicker />
    </Suspense>
  );
}
