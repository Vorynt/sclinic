"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
import type { Plan } from "@/modules/billing/types/billing";
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

export function PlanPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: plans, isLoading, isError } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const onContinue = () => {
    if (!selectedPlanId) return;
    // TODO(stripe): open Checkout Session for selectedPlanId, then return
    // to clinic onboarding on success webhook / return_url.
    const params = new URLSearchParams({
      planId: selectedPlanId,
    });
    const intent = searchParams.get("intent");
    if (intent) {
      params.set("intent", intent);
    }
    router.push(`${routes.onboardingClinic}?${params.toString()}`);
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
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Escolha seu plano
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione o plano da clínica. O pagamento com Stripe entra em breve —
          por agora, continue para cadastrar sua clínica.
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
              <CardContent>
                <p className="font-heading text-2xl font-semibold tracking-tight">
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

      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto sm:self-center"
        disabled={!selectedPlanId}
        onClick={onContinue}>
        Continuar para a clínica
      </Button>
    </div>
  );
}
