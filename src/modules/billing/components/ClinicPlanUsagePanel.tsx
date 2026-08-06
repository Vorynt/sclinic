"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { UsageMeter, type UsageMeterStatus } from "@/components/ui/usage-meter";
import { routes } from "@/config/routes";
import { useClinicPlanQuota } from "@/modules/billing/hooks/use-clinic-plan-quota";
import type { PlanQuotaDimension } from "@/modules/billing/types/billing";
import { formatStorageBytes } from "@/modules/billing/utils/format-storage";
import {
  dimensionLimit,
  dimensionUsage,
} from "@/modules/billing/utils/plan-quota";

type DimensionConfig = {
  dimension: PlanQuotaDimension;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
  formatValue?: (value: number) => string;
};

const DIMENSIONS: DimensionConfig[] = [
  {
    dimension: "users",
    label: "Usuários",
    description: "Membros ativos com acesso à clínica",
    href: routes.users,
    actionLabel: "Gerenciar equipe",
  },
  {
    dimension: "professionals",
    label: "Profissionais",
    description: "Profissionais de saúde vinculados",
    href: routes.professionals,
    actionLabel: "Gerenciar profissionais",
  },
  {
    dimension: "storage",
    label: "Armazenamento",
    description: "Arquivos e anexos da clínica",
    href: routes.accountSubscription,
    actionLabel: "Ver assinatura",
    formatValue: formatStorageBytes,
  },
];

function meterStatus(over: boolean, atCapacity: boolean): UsageMeterStatus {
  if (over) return "over_limit";
  if (atCapacity) return "at_capacity";
  return "ok";
}

function ClinicPlanUsagePanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Owner-facing view of clinic plan quotas (ADR-004).
 */
export function ClinicPlanUsagePanel() {
  const query = useClinicPlanQuota();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Carregando uso do plano…
        </div>
        <ClinicPlanUsagePanelSkeleton />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <QueryErrorState
        description="Não foi possível carregar o uso do plano."
        onRetry={() => {
          void query.refetch();
        }}
        isRetrying={query.isFetching}
      />
    );
  }

  const quota = query.data;
  const planLabel = quota.planName ?? "Sem plano ativo";

  return (
    <div className="flex flex-col gap-6">
      {quota.isOverLimit ? (
        <Alert>
          <WarningCircleIcon />
          <AlertTitle>Clínica acima dos limites do plano</AlertTitle>
          <AlertDescription>
            <p>
              O uso atual excede o plano {planLabel}. Atualize o plano ou reduza
              o uso nas dimensões destacadas para voltar a convidar e cadastrar.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-muted/20 p-5">
        <p className="text-sm text-muted-foreground">Seu plano</p>
        <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
          {planLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          A assinatura é sua; o uso abaixo é desta clínica.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {DIMENSIONS.map((item) => {
          const used = dimensionUsage(quota.usage, item.dimension);
          const limit = dimensionLimit(quota.limits, item.dimension);
          const over = quota.over[item.dimension];
          const atCapacity = quota.atCapacity[item.dimension];
          const status = meterStatus(over, atCapacity);

          return (
            <div key={item.dimension} className="flex flex-col gap-3">
              <UsageMeter
                label={item.label}
                description={item.description}
                used={used}
                limit={limit}
                status={status}
                formatValue={item.formatValue}
              />
              {over || atCapacity ? (
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={item.href}>{item.actionLabel}</Link>
                  </Button>
                  {item.dimension !== "storage" ? (
                    <Button asChild size="sm">
                      <Link href={routes.accountSubscription}>
                        Atualizar plano
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Dados existentes não são removidos em downgrade; apenas novas criações
        ficam bloqueadas ao atingir o teto do seu plano.
      </p>
    </div>
  );
}
