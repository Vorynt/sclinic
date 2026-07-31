"use client"

import {
  CheckCircleIcon,
  CreditCardIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { routes } from "@/config/routes"
import { isLivingSubscriptionStatus } from "@/modules/billing/constants/subscription"
import { useMySubscription } from "@/modules/billing/hooks/use-my-subscription"
import {
  useCreateBillingPortalSession,
  useCreateRegularizeSession,
} from "@/modules/billing/hooks/use-subscription-mutations"
import type {
  SubscriptionStatus,
  SubscriptionWithPlan,
} from "@/modules/billing/types/billing"
import type { AppError } from "@/shared/errors"

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Período de teste",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  unpaid: "Inadimplente",
  incomplete: "Incompleta",
}

/** Brief poll after mount so Portal cancel lands via webhook. */
const PORTAL_SYNC_POLL_MS = 2_500
const PORTAL_SYNC_WINDOW_MS = 30_000

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(cents / 100)
}

function formatDate(value: Date | null): string {
  if (!value) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value)
}

function statusLabel(subscription: SubscriptionWithPlan): string {
  if (
    subscription.cancelAtPeriodEnd &&
    isLivingSubscriptionStatus(subscription.status)
  ) {
    return "Cancelamento agendado"
  }
  return STATUS_LABELS[subscription.status]
}

function statusBadgeVariant(
  subscription: SubscriptionWithPlan,
): "default" | "secondary" | "destructive" | "outline" {
  if (
    subscription.cancelAtPeriodEnd &&
    isLivingSubscriptionStatus(subscription.status)
  ) {
    return "outline"
  }
  if (subscription.status === "active" || subscription.status === "trialing") {
    return "default"
  }
  if (
    subscription.status === "past_due" ||
    subscription.status === "unpaid"
  ) {
    return "destructive"
  }
  return "secondary"
}

function SubscriptionSummary({
  subscription,
}: {
  subscription: SubscriptionWithPlan
}) {
  const portal = useCreateBillingPortalSession({
    onSuccess: (data) => {
      window.location.assign(data.url)
    },
    onError: (error: AppError) => {
      toast.error(error.message)
    },
  })

  const regularize = useCreateRegularizeSession({
    onSuccess: (data) => {
      window.location.assign(data.url)
    },
    onError: (error: AppError) => {
      toast.error(error.message)
    },
  })

  const canOpenPortal = Boolean(subscription.gatewayCustomerId)
  const isLiving = isLivingSubscriptionStatus(subscription.status)
  const needsRegularize = !isLiving
  const accessUntil = formatDate(subscription.currentPeriodEnd)
  const isPending = portal.isPending || regularize.isPending

  const onManage = () => {
    if (needsRegularize) {
      regularize.mutate(
        canOpenPortal
          ? {}
          : {
              planId: subscription.plan.id,
              successPath: routes.home,
              cancelPath: routes.accountSubscription,
            },
      )
      return
    }
    portal.mutate()
  }

  return (
    <div className="flex flex-col gap-6">
      {subscription.cancelAtPeriodEnd && isLiving ? (
        <Alert>
          <CheckCircleIcon />
          <AlertTitle>Assinatura cancelada</AlertTitle>
          <AlertDescription>
            Cancelamento confirmado. Você continua com acesso ao sistema até{" "}
            <span className="font-medium text-foreground">{accessUntil}</span>
            . Depois dessa data a assinatura será encerrada e a renovação não
            ocorrerá.
          </AlertDescription>
        </Alert>
      ) : null}

      {subscription.status === "past_due" ? (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Pagamento pendente</AlertTitle>
          <AlertDescription>
            Não conseguimos processar o último pagamento. Atualize o método de
            pagamento para evitar a suspensão do acesso.
          </AlertDescription>
        </Alert>
      ) : null}

      {subscription.status === "unpaid" ? (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Assinatura inadimplente</AlertTitle>
          <AlertDescription>
            O acesso à clínica está bloqueado. Regularize o pagamento para
            voltar a usar o sistema.
          </AlertDescription>
        </Alert>
      ) : null}

      {subscription.status === "canceled" ? (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Assinatura cancelada</AlertTitle>
          <AlertDescription>
            Sua assinatura foi encerrada. Reative o pagamento para voltar a
            usar a clínica.
          </AlertDescription>
        </Alert>
      ) : null}

      {subscription.status === "incomplete" ? (
        <Alert>
          <WarningCircleIcon />
          <AlertTitle>Assinatura incompleta</AlertTitle>
          <AlertDescription>
            O pagamento não foi concluído. Finalize para liberar o acesso à
            clínica.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/20 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {subscription.plan.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatMoney(
                subscription.plan.priceCents,
                subscription.plan.currency,
              )}
              {subscription.plan.billingCycle === "yearly" ? " /ano" : " /mês"}
            </p>
          </div>
          <Badge variant={statusBadgeVariant(subscription)}>
            {statusLabel(subscription)}
          </Badge>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Período atual</dt>
            <dd className="font-medium text-foreground">
              {formatDate(subscription.currentPeriodStart)} —{" "}
              {formatDate(subscription.currentPeriodEnd)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Renovação</dt>
            <dd className="font-medium text-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Não renova — acesso até ${accessUntil}`
                : isLiving
                  ? "Renova automaticamente"
                  : "Sem renovação ativa"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled={(!canOpenPortal && !needsRegularize) || isPending}
          onClick={onManage}
        >
          {isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Abrindo…
            </>
          ) : (
            <>
              <CreditCardIcon data-icon="inline-start" />
              {needsRegularize ? "Regularizar assinatura" : "Gerenciar assinatura"}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          {needsRegularize
            ? "Cartão e faturas abrem em uma página segura de pagamento."
            : "Cartão, faturas, cancelamento e troca de plano abrem em uma página segura de pagamento. Para reativar a renovação, use o mesmo botão."}
        </p>
        {!canOpenPortal && !needsRegularize ? (
          <p className="text-xs text-muted-foreground">
            Disponível após a primeira assinatura com pagamento online.
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function AccountSubscriptionPanel() {
  const [pollUntil] = useState(() => Date.now() + PORTAL_SYNC_WINDOW_MS)
  const query = useMySubscription({
    refetchInterval: () =>
      Date.now() < pollUntil ? PORTAL_SYNC_POLL_MS : false,
  })

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Spinner />
        <p className="text-sm text-muted-foreground">Carregando assinatura…</p>
      </div>
    )
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <WarningCircleIcon />
        <AlertTitle>Não foi possível carregar</AlertTitle>
        <AlertDescription>
          Tente novamente em instantes.
        </AlertDescription>
      </Alert>
    )
  }

  if (!query.data) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/20 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Nenhuma assinatura
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha um plano para ativar o acesso à sua clínica.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto sm:self-start">
          <Link href={routes.onboardingPlan}>Escolher plano</Link>
        </Button>
      </div>
    )
  }

  return <SubscriptionSummary subscription={query.data} />
}
