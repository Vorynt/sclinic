"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useClinicPlanQuota } from "@/modules/billing/hooks/use-clinic-plan-quota";
import type { PlanQuotaDimension } from "@/modules/billing/types/billing";

const DIMENSION_LABELS: Record<PlanQuotaDimension, string> = {
  users: "usuários",
  professionals: "profissionais",
  storage: "armazenamento",
};

function overLimitSummary(over: Record<PlanQuotaDimension, boolean>): string {
  const parts = (Object.keys(over) as PlanQuotaDimension[])
    .filter((key) => over[key])
    .map((key) => DIMENSION_LABELS[key]);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

function reduceUsageHref(over: Record<PlanQuotaDimension, boolean>): string {
  if (over.users) return routes.users;
  if (over.professionals) return routes.professionals;
  return routes.accountSubscription;
}

/**
 * Persistent shell banner when the active clinic exceeds plan limits (ADR-004).
 */
export function PlanOverLimitBanner() {
  const { data: quota } = useClinicPlanQuota();

  if (!quota?.isOverLimit) return null;

  const summary = overLimitSummary(quota.over);

  return (
    <Alert className="rounded-none border-x-0 border-t-0">
      <WarningCircleIcon />
      <AlertTitle>Clínica acima dos limites do plano</AlertTitle>
      <AlertDescription>
        {quota.isOwner ? (
          <p>
            O uso atual excede o plano
            {quota.planName ? ` ${quota.planName}` : ""}
            {summary ? ` em ${summary}` : ""}. Atualize o plano ou reduza o uso
            para voltar a convidar e cadastrar.
          </p>
        ) : (
          <p>
            Esta clínica está acima dos limites do plano
            {summary ? ` (${summary})` : ""}. Peça ao administrador para
            atualizar o plano ou reduzir o uso.
          </p>
        )}
      </AlertDescription>
      {quota.isOwner ? (
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:gap-3">
          <AlertAction>
            <Button asChild size="sm">
              <Link href={routes.accountSubscription}>Atualizar plano</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={reduceUsageHref(quota.over)}>Reduzir uso</Link>
            </Button>
          </AlertAction>
        </div>
      ) : null}
    </Alert>
  );
}
