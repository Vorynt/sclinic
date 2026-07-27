"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { usePlans } from "@/modules/billing/hooks/use-plans";
import { useCreateCheckoutSession } from "@/modules/billing/hooks/use-subscription-mutations";
import type { Plan } from "@/modules/billing/types/billing";
import type { AppError } from "@/shared/errors";
import { CheckCircleIcon } from "@phosphor-icons/react";

function formatPrice(plan: Plan): string {
  const value = plan.priceCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: plan.currency || "BRL",
  }).format(value);
}

function cycleLabel(cycle: Plan["billingCycle"]): string {
  return cycle === "yearly" ? "/ano" : "/mês";
}

function clinicOnboardingHref(planId: string, intent: string | null): string {
  const params = new URLSearchParams({ planId });
  if (intent) params.set("intent", intent);
  return `${routes.onboardingClinic}?${params.toString()}`;
}

function planContinueHref(planId: string, intent: string | null): string {
  if (intent === "reactivate") {
    return routes.home;
  }
  return clinicOnboardingHref(planId, intent);
}

export function PlanPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: plans, isLoading, isError } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const checkout = useCreateCheckoutSession({
    onSuccess: (data) => {
      window.location.assign(data.url);
    },
    onError: (error: AppError) => {
      toast.error(error.message);
    },
  });

  const intent = searchParams.get("intent");

  const selectedPlan = plans?.find((plan) => plan.id === selectedPlanId);
  const useStripeCheckout = Boolean(selectedPlan?.stripePriceId);

  const onContinue = () => {
    if (!selectedPlanId || !selectedPlan) return;
    const currentIntent = searchParams.get("intent");
    const successPath = planContinueHref(selectedPlanId, currentIntent);
    const cancelPath =
      currentIntent === "reactivate"
        ? `${routes.onboardingPlan}?intent=reactivate`
        : currentIntent
          ? `${routes.onboardingPlan}?intent=${encodeURIComponent(currentIntent)}`
          : routes.onboardingPlan;

    if (useStripeCheckout) {
      checkout.mutate({
        planId: selectedPlanId,
        successPath,
        cancelPath,
      });
      return;
    }

    router.push(successPath);
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-12">
        <Spinner />
        <p className="text-sm text-muted-foreground">Carregando planos…</p>
      </div>
    );
  }

  if (isError || !plans?.length) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum plano disponível no momento. Tente novamente em instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 min-w-1/2">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Escolha seu plano
        </h1>
        <p className="text-sm text-muted-foreground">
          {intent === "reactivate"
            ? useStripeCheckout
              ? "Você será direcionado ao Stripe para reativar a assinatura e voltar a usar sua clínica."
              : "Selecione o plano para reativar a assinatura da sua clínica."
            : useStripeCheckout
              ? "Você será direcionado ao Stripe para concluir o pagamento e, em seguida, cadastrar sua clínica."
              : "Selecione o plano da sua conta. Com Stripe configurado e preço vinculado, o checkout abre automaticamente."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const selected = selectedPlanId === plan.id;
          return (
            <Card
              key={plan.id}
              size="sm"
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => setSelectedPlanId(plan.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedPlanId(plan.id);
                }
              }}
              className={cn(
                "group/card cursor-pointer transition-shadow outline-none",
                selected
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:ring-foreground/20",
              )}>
              <CardHeader>
                <CardTitle className="group-hover/card:shimmer group-hover/card:shimmer-once transition-colors group-hover/card:text-primary">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.description ?? "Plano sclinic"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col">
                <p className="font-heading mt-auto text-2xl font-semibold tracking-tight">
                  {formatPrice(plan)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {cycleLabel(plan.billingCycle)}
                  </span>
                </p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {plan.maxUsers != null ? (
                    <li>Até {plan.maxUsers} usuários</li>
                  ) : null}
                  {plan.maxProfessionals != null ? (
                    <li>Até {plan.maxProfessionals} profissionais</li>
                  ) : null}
                </ul>
              </CardContent>
              <CardFooter className={cn(selected && "justify-between shimmer")}>
                {selected ? (
                  <>
                    <span className="text-xs font-medium text-primary shimmer">
                      Selecionado
                    </span>
                    <CheckCircleIcon
                      weight="fill"
                      className="ml-auto text-primary size-4"
                    />
                  </>
                ) : (
                  <span className="text-xs font-medium text-primary">
                    Selecionar
                  </span>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto sm:self-center"
          disabled={!selectedPlanId || checkout.isPending}
          onClick={onContinue}>
          {checkout.isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Redirecionando…
            </>
          ) : useStripeCheckout ? (
            "Continuar para o pagamento"
          ) : (
            "Continuar para a clínica"
          )}
        </Button>
        {intent === "create-clinic" && (
          <Button onClick={() => router.back()} variant="link">
            Voltar ao sistema
          </Button>
        )}
      </div>
    </div>
  );
}
