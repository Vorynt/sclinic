"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
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
import { routes } from "@/config/routes";
import { SuggestedAvailabilitySlots } from "@/modules/appointments/components/SuggestedAvailabilitySlots";
import { APPOINTMENT_TYPE_LABELS } from "@/modules/appointments/constants/appointments";
import { useCreateAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import { appointmentTypeSchema } from "@/modules/appointments/schemas/appointment.schema";
import type { AppointmentType } from "@/modules/appointments/types/appointment";
import { APPOINTMENT_DURATION_OPTIONS } from "@/modules/appointments/utils/calendar-constants";
import { readSuggestedSlotsFromMeta } from "@/modules/appointments/utils/suggested-slots";
import { PatientCombobox } from "@/modules/patients/components/PatientCombobox";
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog";
import type { Patient } from "@/modules/patients/types/patient";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";
import { parseISODate, toISODate } from "@/utils/date";

const appointmentTypeOptions = Object.entries(APPOINTMENT_TYPE_LABELS) as [
  AppointmentType,
  string,
][];

const scheduleFormSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente"),
  professionalId: z.string().uuid("Selecione um profissional"),
  type: appointmentTypeSchema,
  date: z.string().trim().min(1, "Selecione a data"),
  startTime: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido"),
  durationMinutes: z.string().min(1, "Selecione a duração"),
  reason: z
    .string()
    .trim()
    .max(300, "Motivo deve ter no máximo 300 caracteres")
    .optional(),
});

type ScheduleFormValues = z.input<typeof scheduleFormSchema>;
type ScheduleFormOutput = z.output<typeof scheduleFormSchema>;

type LockedPatient = {
  id: string;
  name: string;
};

type AppointmentFormProps = {
  defaultStartsAt?: Date;
  /** When set, patient is pre-selected and the combobox is disabled. */
  lockedPatient?: LockedPatient;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function roundToNextStep(date: Date, stepMinutes: number): Date {
  const rounded = new Date(date);
  const remainder = rounded.getMinutes() % stepMinutes;
  if (remainder !== 0) {
    rounded.setMinutes(rounded.getMinutes() + (stepMinutes - remainder));
  }
  rounded.setSeconds(0, 0);
  return rounded;
}

export function AppointmentForm({
  defaultStartsAt,
  lockedPatient,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [selectedPatientLabel, setSelectedPatientLabel] = useState<
    string | null
  >(lockedPatient?.name ?? null);

  const isPatientLocked = Boolean(lockedPatient);
  const initialDate = roundToNextStep(defaultStartsAt ?? new Date(), 30);

  const professionalsQuery = useProfessionalsForSchedulingQuery();

  const form = useForm<ScheduleFormValues, unknown, ScheduleFormOutput>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      patientId: lockedPatient?.id ?? "",
      professionalId: "",
      type: "consultation",
      date: toISODate(initialDate),
      startTime: `${String(initialDate.getHours()).padStart(2, "0")}:${String(
        initialDate.getMinutes(),
      ).padStart(2, "0")}`,
      durationMinutes: "30",
      reason: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  function clearAvailabilityFeedback() {
    setFormError(null);
    setSuggestedSlots([]);
  }

  function handlePatientCreated(patient: Patient) {
    setSelectedPatientLabel(patient.name);
    setValue("patientId", patient.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code });
      setSuggestedSlots(readSuggestedSlotsFromMeta(error.meta));
      return;
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    });
    setSuggestedSlots([]);
  }

  const createAppointment = useCreateAppointmentMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      clearAvailabilityFeedback();
      onSuccess?.();
    },
    onError: handleError,
  });

  const onSubmit = handleSubmit((data) => {
    clearAvailabilityFeedback();

    const startDate = parseISODate(data.date);
    if (!startDate) {
      setFormError({
        message: "Data inválida",
        code: ErrorCode.VALIDATION_FAILED,
      });
      return;
    }

    const [hours, minutes] = data.startTime.split(":").map(Number);
    const startsAt = new Date(startDate);
    startsAt.setHours(hours, minutes, 0, 0);
    const endsAt = addMinutes(startsAt, Number(data.durationMinutes));

    createAppointment.mutate({
      patientId: data.patientId,
      professionalId: data.professionalId,
      startsAt,
      endsAt,
      type: data.type,
      reason: data.reason,
    });
  });

  const professionals = professionalsQuery.data ?? [];
  const hasProfessionals = professionals.length > 0;
  const isProfessionalsEmpty =
    !professionalsQuery.isLoading && !hasProfessionals;
  const isPending = createAppointment.isPending;

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {formError && (
            <FormErrorAlert message={formError.message} code={formError.code} />
          )}
          <FieldGroup className="flex flex-col gap-4">
            <Field data-invalid={Boolean(errors.patientId) || undefined}>
              <FieldLabel>Paciente</FieldLabel>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <PatientCombobox
                    value={field.value}
                    onValueChange={(patientId) => {
                      setSelectedPatientLabel(null);
                      field.onChange(patientId);
                    }}
                    displayLabel={selectedPatientLabel}
                    onCreatePatient={
                      isPatientLocked
                        ? undefined
                        : () => setPatientDialogOpen(true)
                    }
                    disabled={isPending || isPatientLocked}
                    aria-invalid={Boolean(errors.patientId) || undefined}
                  />
                )}
              />
              <FieldError errors={[errors.patientId]} />
            </Field>

            <Field data-invalid={Boolean(errors.professionalId) || undefined}>
              <FieldLabel>Profissional</FieldLabel>
              <Controller
                name="professionalId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isPending ||
                      professionalsQuery.isLoading ||
                      isProfessionalsEmpty
                    }>
                    <SelectTrigger
                      aria-invalid={
                        Boolean(errors.professionalId) || undefined
                      }>
                      <SelectValue
                        placeholder={
                          isProfessionalsEmpty
                            ? "Nenhum profissional cadastrado"
                            : "Selecione o profissional"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}>
                          {professional.fullName}
                          {professional.specialty
                            ? ` · ${professional.specialty}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isProfessionalsEmpty ? (
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={routes.professionals}
                    className="font-medium shimmer text-primary underline-offset-4 hover:underline">
                    Convidar profissional
                  </Link>{" "}
                  para a clínica.
                </p>
              ) : null}
              <FieldError errors={[errors.professionalId]} />
            </Field>

            <Field data-invalid={Boolean(errors.type) || undefined}>
              <FieldLabel>Tipo da consulta</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.type) || undefined}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypeOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.type]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                className="sm:col-span-1"
                data-invalid={Boolean(errors.date) || undefined}>
                <FieldLabel htmlFor="appointment-date">Data</FieldLabel>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="appointment-date"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isPending}
                      aria-invalid={Boolean(errors.date) || undefined}
                    />
                  )}
                />
                <FieldError errors={[errors.date]} />
              </Field>

              <Field data-invalid={Boolean(errors.startTime) || undefined}>
                <FieldLabel htmlFor="appointment-start-time">
                  Horário início
                </FieldLabel>
                <Input
                  id="appointment-start-time"
                  type="time"
                  aria-invalid={Boolean(errors.startTime) || undefined}
                  disabled={isPending}
                  {...register("startTime")}
                />
                <FieldError errors={[errors.startTime]} />
              </Field>

              <Field
                data-invalid={Boolean(errors.durationMinutes) || undefined}>
                <FieldLabel>Duração</FieldLabel>
                <Controller
                  name="durationMinutes"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}>
                      <SelectTrigger
                        aria-invalid={
                          Boolean(errors.durationMinutes) || undefined
                        }>
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPOINTMENT_DURATION_OPTIONS.map((minutes) => (
                          <SelectItem key={minutes} value={String(minutes)}>
                            {minutes} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.durationMinutes]} />
              </Field>
            </div>

            {formError && (
              <SuggestedAvailabilitySlots
                slots={suggestedSlots}
                onSelect={clearAvailabilityFeedback}
              />
            )}

            <Field data-invalid={Boolean(errors.reason) || undefined}>
              <FieldLabel htmlFor="appointment-reason">Motivo</FieldLabel>
              <Textarea
                id="appointment-reason"
                placeholder="Opcional"
                aria-invalid={Boolean(errors.reason) || undefined}
                disabled={isPending}
                {...register("reason")}
              />
              <FieldError errors={[errors.reason]} />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}>
                Cancelar
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : null}
              Agendar
            </Button>
          </div>
        </form>
      </FormProvider>

      {isPatientLocked ? null : (
        <PatientFormDialog
          open={patientDialogOpen}
          onOpenChange={setPatientDialogOpen}
          onSuccess={handlePatientCreated}
        />
      )}
    </>
  );
}
