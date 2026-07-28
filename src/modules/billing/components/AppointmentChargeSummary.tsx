"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Permission } from "@/config/permissions";
import { MarkChargePaidDialog } from "@/modules/billing/components/MarkChargePaidDialog";
import { CHARGE_STATUS_LABELS } from "@/modules/billing/constants/charges";
import { useMarkChargePaidMutation } from "@/modules/billing/hooks/use-charge-mutations";
import { useChargeByAppointmentQuery } from "@/modules/billing/hooks/use-charges";
import { formatCentsToBrl } from "@/modules/billing/utils/money";
import { useAuth } from "@/providers/AuthProvider";

type AppointmentChargeSummaryProps = {
  appointmentId: string;
};

/** Dedicated charge section for the appointment detail drawer body. */
export function AppointmentChargeSummary({
  appointmentId,
}: AppointmentChargeSummaryProps) {
  const { canAny, isLoading: authLoading } = useAuth();
  const canSee = canAny(
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );
  const canCollect = canAny(
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );

  const chargeQuery = useChargeByAppointmentQuery(
    appointmentId,
    !authLoading && canSee,
  );
  const [payOpen, setPayOpen] = useState(false);

  const markPaid = useMarkChargePaidMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado");
      setPayOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  if (authLoading || !canSee) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col gap-3 rounded-md border border-border px-4 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-foreground">Cobrança</h3>
          <p className="text-xs text-muted-foreground">
            Cobrança registrada para este agendamento.
          </p>
        </div>

        {chargeQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Carregando…
          </div>
        ) : chargeQuery.isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar a cobrança.
          </p>
        ) : !chargeQuery.data ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma cobrança registrada. Informe o valor ao agendar para gerar
            a cobrança no balcão.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatCentsToBrl(chargeQuery.data.amountCents)}
              </span>
              <Badge
                variant={
                  chargeQuery.data.status === "paid" ? "secondary" : "outline"
                }>
                {CHARGE_STATUS_LABELS[chargeQuery.data.status] ??
                  chargeQuery.data.status}
              </Badge>
            </div>
            {chargeQuery.data.status === "pending" && canCollect ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit shrink-0"
                onClick={() => setPayOpen(true)}>
                <CheckCircleIcon />
                Marcar pago
              </Button>
            ) : null}
          </div>
        )}
      </section>

      {chargeQuery.data ? (
        <MarkChargePaidDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          description={formatCentsToBrl(chargeQuery.data.amountCents)}
          isPending={markPaid.isPending}
          onConfirm={(method) => {
            if (!chargeQuery.data) return;
            markPaid.mutate({ chargeId: chargeQuery.data.id, method });
          }}
        />
      ) : null}
    </>
  );
}
