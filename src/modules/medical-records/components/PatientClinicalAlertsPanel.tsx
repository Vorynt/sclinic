"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { QueryErrorState } from "@/components/status/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  CLINICAL_ALERT_KIND_LABELS,
  CLINICAL_ALERT_KINDS,
  CLINICAL_ALERT_SEVERITIES,
  CLINICAL_ALERT_SEVERITY_LABELS,
} from "@/modules/medical-records/constants/clinical-alerts";
import {
  useCreateClinicalAlertMutation,
  useDeleteClinicalAlertMutation,
} from "@/modules/medical-records/hooks/use-clinical-alert-mutations";
import { useClinicalAlertsQuery } from "@/modules/medical-records/hooks/use-clinical-alerts";
import { createClinicalAlertSchema } from "@/modules/medical-records/schemas/clinical-alert.schema";
import type {
  ClinicalAlert,
  ClinicalAlertSeverity,
} from "@/modules/medical-records/types/clinical-alert";

type PatientClinicalAlertsPanelProps = {
  patientId: string;
  /** When false, hide create/delete (read-only chart context). Default true. */
  canWrite?: boolean;
};

type FormValues = z.input<typeof createClinicalAlertSchema>;
type FormOutput = z.output<typeof createClinicalAlertSchema>;

function severityVariant(
  severity: ClinicalAlertSeverity,
): "destructive" | "secondary" | "outline" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "outline";
}

export function PatientClinicalAlertsPanel({
  patientId,
  canWrite = true,
}: PatientClinicalAlertsPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const alertsQuery = useClinicalAlertsQuery(patientId);

  return (
    <section className="flex flex-col gap-4 rounded-md border border-border px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Alertas clínicos
          </h3>
          <p className="text-xs text-muted-foreground">
            Alergias, restrições e avisos permanentes do paciente.
          </p>
        </div>

        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            Adicionar
          </Button>
        ) : null}
      </div>

      {alertsQuery.isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : null}

      {alertsQuery.isError ? (
        <QueryErrorState
          description="Não foi possível carregar os alertas clínicos."
          onRetry={() => {
            void alertsQuery.refetch();
          }}
          isRetrying={alertsQuery.isFetching}
        />
      ) : null}

      {!alertsQuery.isLoading &&
      !alertsQuery.isError &&
      alertsQuery.data &&
      alertsQuery.data.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          Nenhum alerta clínico cadastrado.
        </p>
      ) : null}

      {!alertsQuery.isLoading &&
      !alertsQuery.isError &&
      alertsQuery.data &&
      alertsQuery.data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {alertsQuery.data.map((alert) => (
            <ClinicalAlertListItem
              key={alert.id}
              alert={alert}
              canWrite={canWrite}
            />
          ))}
        </ul>
      ) : null}

      {canWrite ? (
        <ClinicalAlertCreateDialog
          patientId={patientId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      ) : null}
    </section>
  );
}

function ClinicalAlertListItem({
  alert,
  canWrite,
}: {
  alert: ClinicalAlert;
  canWrite: boolean;
}) {
  const removeAlert = useDeleteClinicalAlertMutation({
    onSuccess: () => toast.success("Alerta removido"),
    onError: (error) => toast.error(error.message),
  });

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-3">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={severityVariant(alert.severity)}>
            {CLINICAL_ALERT_KIND_LABELS[alert.kind]}
          </Badge>
          <span className="text-sm font-medium text-foreground">
            {alert.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Severidade: {CLINICAL_ALERT_SEVERITY_LABELS[alert.severity]}
        </p>
        {alert.notes ? (
          <p className="text-sm text-muted-foreground">{alert.notes}</p>
        ) : null}
      </div>

      {canWrite ? (
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label="Remover alerta"
          disabled={removeAlert.isPending}
          onClick={() => removeAlert.mutate({ id: alert.id })}>
          {removeAlert.isPending ? <Spinner /> : <TrashIcon />}
        </Button>
      ) : null}
    </li>
  );
}

function ClinicalAlertCreateDialog({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(createClinicalAlertSchema),
    defaultValues: {
      patientId,
      kind: "allergy",
      label: "",
      severity: "medium",
      notes: "",
    },
  });

  const createAlert = useCreateClinicalAlertMutation({
    onSuccess: () => {
      toast.success("Alerta adicionado");
      reset({
        patientId,
        kind: "allergy",
        label: "",
        severity: "medium",
        notes: "",
      });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset({
            patientId,
            kind: "allergy",
            label: "",
            severity: "medium",
            notes: "",
          });
        }
        onOpenChange(nextOpen);
      }}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Novo alerta clínico</DialogTitle>
          <DialogDescription>
            Cadastre alergia, restrição ou aviso permanente do paciente.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => createAlert.mutate(data))}>
          <input type="hidden" {...register("patientId")} />

          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.kind) || undefined}>
              <FieldLabel>Tipo</FieldLabel>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={Boolean(errors.kind) || undefined}>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLINICAL_ALERT_KINDS.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {CLINICAL_ALERT_KIND_LABELS[kind]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.kind]} />
            </Field>

            <Field data-invalid={Boolean(errors.severity) || undefined}>
              <FieldLabel>Severidade</FieldLabel>
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "medium"}
                    onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={Boolean(errors.severity) || undefined}>
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLINICAL_ALERT_SEVERITIES.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {CLINICAL_ALERT_SEVERITY_LABELS[severity]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.severity]} />
            </Field>

            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(errors.label) || undefined}>
              <FieldLabel>Descrição</FieldLabel>
              <Input
                placeholder="Ex.: Dipirona, anticoagulante…"
                aria-invalid={Boolean(errors.label) || undefined}
                {...register("label")}
              />
              <FieldError errors={[errors.label]} />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Observação (opcional)</FieldLabel>
              <Textarea
                placeholder="Detalhe adicional"
                {...register("notes")}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={createAlert.isPending}
              onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAlert.isPending}>
              {createAlert.isPending ? <Spinner /> : null}
              Salvar alerta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
