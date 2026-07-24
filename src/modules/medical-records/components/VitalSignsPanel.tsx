"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { VitalSignsHistoryPanel } from "@/modules/medical-records/components/VitalSignsHistoryPanel";
import {
  usePatientVitalSignsQuery,
  useVitalSignsForAppointmentQuery,
} from "@/modules/medical-records/hooks/use-vital-signs";
import { useUpsertVitalSignsMutation } from "@/modules/medical-records/hooks/use-vital-signs-mutations";
import { upsertVitalSignsSchema } from "@/modules/medical-records/schemas/vital-signs.schema";
import type {
  VitalSigns,
  VitalSignsForAppointment,
} from "@/modules/medical-records/types/vital-signs";
import { calculateBmi } from "@/modules/medical-records/utils/bmi";
import { formatVitalSignsSummary } from "@/modules/medical-records/utils/format-vital-signs";

type VitalSignsPanelProps = {
  appointmentId: string;
};

type FormValues = z.input<typeof upsertVitalSignsSchema>;
type FormOutput = z.output<typeof upsertVitalSignsSchema>;

function toFormDefaults(
  appointmentId: string,
  vitals: VitalSigns | null,
): FormValues {
  return {
    appointmentId,
    systolicMmHg: vitals?.systolicMmHg ?? "",
    diastolicMmHg: vitals?.diastolicMmHg ?? "",
    heartRateBpm: vitals?.heartRateBpm ?? "",
    respiratoryRate: vitals?.respiratoryRate ?? "",
    temperatureC: vitals?.temperatureC ?? "",
    weightKg: vitals?.weightKg ?? "",
    heightCm: vitals?.heightCm ?? "",
    spo2Percent: vitals?.spo2Percent ?? "",
  };
}

export function VitalSignsPanel({ appointmentId }: VitalSignsPanelProps) {
  const vitalsQuery = useVitalSignsForAppointmentQuery(appointmentId);
  const historyQuery = usePatientVitalSignsQuery(
    {
      patientId: vitalsQuery.data?.patientId ?? "",
      excludeAppointmentId: appointmentId,
    },
    Boolean(vitalsQuery.data?.patientId),
  );

  if (vitalsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (vitalsQuery.isError || !vitalsQuery.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os sinais vitais.
      </p>
    );
  }

  return (
    <VitalSignsPanelContent
      key={appointmentId}
      appointmentId={appointmentId}
      data={vitalsQuery.data}
      historyItems={historyQuery.data}
      historyLoading={historyQuery.isLoading}
      historyError={historyQuery.isError}
    />
  );
}

type VitalSignsPanelContentProps = {
  appointmentId: string;
  data: VitalSignsForAppointment;
  historyItems: VitalSigns[] | undefined;
  historyLoading: boolean;
  historyError: boolean;
};

function VitalSignsPanelContent({
  appointmentId,
  data,
  historyItems,
  historyLoading,
  historyError,
}: VitalSignsPanelContentProps) {
  const editable = data.editable;
  const hasVitals = data.vitals != null;
  const showEmptyReadonly = !editable && !hasVitals;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(upsertVitalSignsSchema),
    defaultValues: toFormDefaults(appointmentId, data.vitals),
  });

  const weightKg = useWatch({ control, name: "weightKg" });
  const heightCm = useWatch({ control, name: "heightCm" });
  const watchedBmi = calculateBmi(
    weightKg === "" || weightKg == null ? null : Number(weightKg),
    heightCm === "" || heightCm == null ? null : Number(heightCm),
  );

  const upsert = useUpsertVitalSignsMutation({
    onSuccess: () => toast.success("Sinais vitais salvos"),
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Sinais vitais
          </h2>
          <p className="text-sm text-muted-foreground">
            {editable
              ? "Registre as medições deste atendimento."
              : "Somente leitura — o atendimento não está em andamento."}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {showEmptyReadonly ? (
          <div className="flex min-h-64 items-center justify-center rounded-md border border-dashed border-border px-6 py-10">
            <div className="flex max-w-sm flex-col items-center gap-1 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum sinal vital neste atendimento
              </p>
              <p className="text-sm text-muted-foreground">
                Não há medições registradas para esta consulta.
              </p>
            </div>
          </div>
        ) : editable ? (
          <form
            className="flex flex-col gap-4 rounded-md border border-border px-4 py-4"
            onSubmit={handleSubmit((values) => upsert.mutate(values))}
            noValidate>
            <input type="hidden" {...register("appointmentId")} />

            <FieldGroup className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.systolicMmHg) || undefined}>
                <FieldLabel>PA sistólica (mmHg)</FieldLabel>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.systolicMmHg) || undefined}
                  {...register("systolicMmHg")}
                />
                <FieldError errors={[errors.systolicMmHg]} />
              </Field>

              <Field data-invalid={Boolean(errors.diastolicMmHg) || undefined}>
                <FieldLabel>PA diastólica (mmHg)</FieldLabel>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.diastolicMmHg) || undefined}
                  {...register("diastolicMmHg")}
                />
                <FieldError errors={[errors.diastolicMmHg]} />
              </Field>

              <Field data-invalid={Boolean(errors.heartRateBpm) || undefined}>
                <FieldLabel>FC (bpm)</FieldLabel>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.heartRateBpm) || undefined}
                  {...register("heartRateBpm")}
                />
                <FieldError errors={[errors.heartRateBpm]} />
              </Field>

              <Field
                data-invalid={Boolean(errors.respiratoryRate) || undefined}>
                <FieldLabel>FR (rpm)</FieldLabel>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.respiratoryRate) || undefined}
                  {...register("respiratoryRate")}
                />
                <FieldError errors={[errors.respiratoryRate]} />
              </Field>

              <Field data-invalid={Boolean(errors.temperatureC) || undefined}>
                <FieldLabel>Temperatura (°C)</FieldLabel>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  aria-invalid={Boolean(errors.temperatureC) || undefined}
                  {...register("temperatureC")}
                />
                <FieldError errors={[errors.temperatureC]} />
              </Field>

              <Field data-invalid={Boolean(errors.spo2Percent) || undefined}>
                <FieldLabel>SpO₂ (%)</FieldLabel>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.spo2Percent) || undefined}
                  {...register("spo2Percent")}
                />
                <FieldError errors={[errors.spo2Percent]} />
              </Field>

              <Field data-invalid={Boolean(errors.weightKg) || undefined}>
                <FieldLabel>Peso (kg)</FieldLabel>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  aria-invalid={Boolean(errors.weightKg) || undefined}
                  {...register("weightKg")}
                />
                <FieldError errors={[errors.weightKg]} />
              </Field>

              <Field data-invalid={Boolean(errors.heightCm) || undefined}>
                <FieldLabel>Altura (cm)</FieldLabel>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  aria-invalid={Boolean(errors.heightCm) || undefined}
                  {...register("heightCm")}
                />
                <FieldError errors={[errors.heightCm]} />
              </Field>
            </FieldGroup>

            {watchedBmi != null ? (
              <p className="text-sm text-muted-foreground">
                IMC calculado:{" "}
                <span className="font-medium text-foreground">
                  {watchedBmi}
                </span>
              </p>
            ) : null}

            <Button type="submit" className="w-fit" disabled={upsert.isPending}>
              {upsert.isPending ? <Spinner /> : null}
              Salvar sinais vitais
            </Button>
          </form>
        ) : data.vitals ? (
          <div className="rounded-md border border-border px-4 py-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              {formatVitalSignsSummary(data.vitals).map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
              {calculateBmi(data.vitals.weightKg, data.vitals.heightCm) !=
              null ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">IMC</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {calculateBmi(data.vitals.weightKg, data.vitals.heightCm)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        <VitalSignsHistoryPanel
          items={historyItems}
          isLoading={historyLoading}
          isError={historyError}
        />
      </div>
    </div>
  );
}
