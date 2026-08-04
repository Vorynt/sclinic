"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, startOfDay } from "date-fns";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useHookFormMask } from "use-mask-input";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert, scrollFormToTop } from "@/components/ui/form-error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { SuggestedAvailabilitySlots } from "@/modules/appointments/components/SuggestedAvailabilitySlots";
import {
  APPOINTMENT_TYPE_LABELS,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments";
import { useCreateAppointmentMutation } from "@/modules/appointments/hooks/use-appointment-mutations";
import type { CreateAppointmentInput } from "@/modules/appointments/schemas/appointment.schema";
import { appointmentTypeSchema } from "@/modules/appointments/schemas/appointment.schema";
import type { AppointmentType } from "@/modules/appointments/types/appointment";
import { APPOINTMENT_DURATION_OPTIONS } from "@/modules/appointments/utils/calendar-constants";
import { readSuggestedSlotsFromMeta } from "@/modules/appointments/utils/suggested-slots";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { BILLING_KIND_LABELS } from "@/modules/billing/constants/charges";
import { useActiveClinicServices } from "@/modules/billing/hooks/use-clinic-services";
import {
  computeChargeAmountCents,
  type BillingKind,
} from "@/modules/billing/utils/charge-pricing";
import {
  formatCentsToBrl,
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money";
import { PatientCombobox } from "@/modules/patients/components/PatientCombobox";
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog";
import type { Patient } from "@/modules/patients/types/patient";
import { ProfessionalCombobox } from "@/modules/professionals/components/ProfessionalCombobox";
import { formatProfessionalSchedulingLabel } from "@/modules/professionals/constants/professionals";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import { useAuth } from "@/providers/AuthProvider";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";
import { parseISODate, toISODate } from "@/utils/date";
import { CURRENCY_MASK_OPTIONS, MASKS } from "@/utils/mask";

const appointmentTypeOptions = Object.entries(APPOINTMENT_TYPE_LABELS) as [
  AppointmentType,
  string,
][];

const DISCOUNT_PRESETS = [5, 10, 15, 20] as const;

const billingKindSchema = z.enum(["standard", "courtesy", "return"]);

const scheduleFormSchema = z
  .object({
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
    serviceId: z.string().uuid("Selecione um serviço"),
    discountPercent: z.coerce
      .number()
      .min(0, "Desconto mínimo é 0%")
      .max(100, "Desconto máximo é 100%")
      .default(0),
    billingKind: billingKindSchema.default("standard"),
    amountBrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const day = parseISODate(data.date);
    if (!day) return;

    const [hours, minutes] = data.startTime.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    const startsAt = new Date(day);
    startsAt.setHours(hours, minutes, 0, 0);

    if (startsAt.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        message: "Não é possível agendar para um horário no passado.",
        path: ["startTime"],
      });
    }

    const amountRaw = data.amountBrl?.trim() ?? "";
    if (!isEmptyMoneyInput(amountRaw) && parseBrlToCents(amountRaw) == null) {
      ctx.addIssue({
        code: "custom",
        message: "Informe um valor válido maior que zero.",
        path: ["amountBrl"],
      });
    }
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
  /** Pre-select appointment type (e.g. follow_up from attendance). */
  defaultType?: AppointmentType;
  /** When set, only these types appear in the select. */
  allowedTypes?: readonly AppointmentType[];
  /** Pre-select professional when the user can choose any. */
  defaultProfessionalId?: string | null;
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

/** Prefer `defaultStartsAt` when still in the future; otherwise next step from now. */
function resolveInitialStartsAt(defaultStartsAt?: Date): Date {
  const now = new Date();
  const candidate = roundToNextStep(defaultStartsAt ?? now, 30);
  if (candidate.getTime() > now.getTime()) {
    return candidate;
  }
  return roundToNextStep(now, 30);
}

export function AppointmentForm({
  defaultStartsAt,
  lockedPatient,
  defaultType = "consultation",
  allowedTypes,
  defaultProfessionalId = null,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const formId = useId();
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
  const today = startOfDay(new Date());
  const initialDate = resolveInitialStartsAt(defaultStartsAt);
  const typeOptions = allowedTypes
    ? appointmentTypeOptions.filter(([value]) => allowedTypes.includes(value))
    : appointmentTypeOptions;
  const resolvedDefaultType =
    allowedTypes && !allowedTypes.includes(defaultType)
      ? (allowedTypes[0] ?? defaultType)
      : defaultType;

  const sessionQuery = useAuthSession();
  const { can, canAny } = useAuth();
  const canCollect = canAny(
    Permission.FINANCIAL_COLLECT,
    Permission.FINANCIAL_MANAGE,
  );
  const canManageFinancial = can(Permission.FINANCIAL_MANAGE);
  const isProfessionalLocked = isSelfScheduleOnlyRole(
    sessionQuery.data?.membership?.roleKey,
  );
  const professionalsQuery = useProfessionalsForSchedulingQuery();
  const activeServicesQuery = useActiveClinicServices();

  const form = useForm<ScheduleFormValues, unknown, ScheduleFormOutput>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      patientId: lockedPatient?.id ?? "",
      professionalId: defaultProfessionalId ?? "",
      type: resolvedDefaultType,
      date: toISODate(initialDate),
      startTime: `${String(initialDate.getHours()).padStart(2, "0")}:${String(
        initialDate.getMinutes(),
      ).padStart(2, "0")}`,
      durationMinutes: "30",
      reason: "",
      serviceId: "",
      discountPercent: 0,
      billingKind: "standard",
      amountBrl: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const registerWithMask = useHookFormMask(register);

  const professionals = professionalsQuery.data ?? [];
  const activeServices = activeServicesQuery.data ?? [];
  const selectedServiceId = watch("serviceId");
  const selectedDiscount = watch("discountPercent");
  const selectedBillingKind = watch("billingKind") as BillingKind;
  const selectedOverrideBrl = watch("amountBrl") ?? "";
  const selectedService = activeServices.find(
    (service) => service.id === selectedServiceId,
  );

  const previewAmountCents = selectedService
    ? computeChargeAmountCents({
        listAmountCents: selectedService.priceCents,
        discountPercent: Number(selectedDiscount) || 0,
        billingKind: selectedBillingKind,
        amountCentsOverride:
          canManageFinancial && !isEmptyMoneyInput(selectedOverrideBrl)
            ? (parseBrlToCents(selectedOverrideBrl) ?? undefined)
            : undefined,
      })
    : null;
  const lockedProfessionalLabel = isProfessionalLocked
    ? professionals[0]
      ? formatProfessionalSchedulingLabel({
          fullName: professionals[0].fullName,
          treatmentPronoun: professionals[0].treatmentPronoun,
          specialty: professionals[0].specialty,
        })
      : null
    : null;

  useEffect(() => {
    if (!isProfessionalLocked) return;
    const selfProfessional = professionalsQuery.data?.[0];
    if (!selfProfessional) return;
    setValue("professionalId", selfProfessional.id, {
      shouldValidate: true,
    });
  }, [isProfessionalLocked, professionalsQuery.data, setValue]);

  useEffect(() => {
    if (isProfessionalLocked || !defaultProfessionalId) return;
    setValue("professionalId", defaultProfessionalId, {
      shouldValidate: true,
    });
  }, [defaultProfessionalId, isProfessionalLocked, setValue]);

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
      setFormError({
        message: getClientMessage(error.code),
        code: error.code,
      });
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

  const onSubmit = handleSubmit(
    (data) => {
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

      const amountRaw = data.amountBrl?.trim() ?? "";
      const amountCentsOverride =
        canManageFinancial && !isEmptyMoneyInput(amountRaw)
          ? parseBrlToCents(amountRaw)
          : undefined;

      const payload: CreateAppointmentInput = {
        patientId: data.patientId,
        professionalId: data.professionalId,
        startsAt,
        endsAt,
        type: data.type,
        reason: data.reason,
        serviceId: data.serviceId,
        discountPercent: canCollect ? (data.discountPercent ?? 0) : 0,
        billingKind: canCollect ? (data.billingKind ?? "standard") : "standard",
        ...(amountCentsOverride != null ? { amountCentsOverride } : {}),
      };

      createAppointment.mutate(payload);
    },
    () => {
      scrollFormToTop(document.getElementById(formId));
    },
  );

  const hasProfessionals = professionals.length > 0;
  const hasActiveServices = activeServices.length > 0;
  const isServicesEmpty = !activeServicesQuery.isLoading && !hasActiveServices;
  const isProfessionalsEmpty =
    !professionalsQuery.isLoading && !hasProfessionals;
  const isPending = createAppointment.isPending;

  return (
    <>
      <FormProvider {...form}>
        <form
          id={formId}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            {formError && (
              <FormErrorAlert
                message={formError.message}
              />
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
                    <ProfessionalCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      displayLabel={lockedProfessionalLabel}
                      disabled={
                        isPending ||
                        sessionQuery.isLoading ||
                        professionalsQuery.isLoading ||
                        isProfessionalsEmpty ||
                        isProfessionalLocked
                      }
                      aria-invalid={Boolean(errors.professionalId) || undefined}
                    />
                  )}
                />
                {isProfessionalsEmpty ? (
                  <p className="text-sm text-muted-foreground">
                    {isProfessionalLocked ? (
                      "Seu perfil profissional não está vinculado a esta clínica."
                    ) : (
                      <>
                        <Link
                          href={routes.professionals}
                          className="font-medium shimmer text-primary underline-offset-4 hover:underline">
                          Convidar profissional
                        </Link>{" "}
                        para a clínica.
                      </>
                    )}
                  </p>
                ) : null}
                <FieldError errors={[errors.professionalId]} />
              </Field>

              <Field data-invalid={Boolean(errors.type) || undefined}>
                <FieldLabel>Tipo do atendimento</FieldLabel>
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
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map(([value, label]) => (
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
                        startMonth={today}
                        disabledDates={{ before: today }}
                        aria-invalid={Boolean(errors.date) || undefined}
                      />
                    )}
                  />
                  <FieldError errors={[errors.date]} />
                </Field>

                <Field data-invalid={Boolean(errors.startTime) || undefined}>
                  <FieldLabel htmlFor="appointment-start-time">
                    Horário
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
                <FieldLabel htmlFor="appointment-reason">
                  Motivo da consulta
                </FieldLabel>
                <Textarea
                  id="appointment-reason"
                  placeholder="Opcional — ex.: check-up, dor"
                  aria-invalid={Boolean(errors.reason) || undefined}
                  disabled={isPending}
                  {...register("reason")}
                />
                <FieldError errors={[errors.reason]} />
              </Field>

              <Field data-invalid={Boolean(errors.serviceId) || undefined}>
                <FieldLabel>Serviço</FieldLabel>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending || activeServicesQuery.isLoading}>
                      <SelectTrigger
                        aria-invalid={Boolean(errors.serviceId) || undefined}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} ·{" "}
                            {formatCentsToBrl(service.priceCents)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {isServicesEmpty ? (
                  <p className="text-sm text-muted-foreground">
                    Cadastre serviços em{" "}
                    <Link
                      href={routes.settingsServices}
                      className="font-medium text-primary underline-offset-4 hover:underline">
                      Configurações → Serviços
                    </Link>
                    .
                  </p>
                ) : selectedService ? (
                  <p className="text-xs text-muted-foreground">
                    Valor do serviço:{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCentsToBrl(selectedService.priceCents)}
                    </span>
                  </p>
                ) : null}
                <FieldError errors={[errors.serviceId]} />
              </Field>

              {canCollect ? (
                <>
                  <Field
                    data-invalid={Boolean(errors.discountPercent) || undefined}>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel htmlFor="appointment-discount">
                        Desconto no valor
                      </FieldLabel>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {Number(selectedDiscount) || 0}%
                      </span>
                    </div>
                    <Controller
                      name="discountPercent"
                      control={control}
                      render={({ field }) => {
                        const isDiscountDisabled =
                          isPending ||
                          selectedBillingKind === "courtesy" ||
                          selectedBillingKind === "return";
                        const discountValue = Number(field.value) || 0;
                        return (
                          <>
                            <Slider
                              id="appointment-discount"
                              min={0}
                              max={100}
                              step={5}
                              value={[discountValue]}
                              disabled={isDiscountDisabled}
                              aria-invalid={
                                Boolean(errors.discountPercent) || undefined
                              }
                              onValueChange={([value]) =>
                                field.onChange(value ?? 0)
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              {DISCOUNT_PRESETS.map((preset) => {
                                const isSelected = discountValue === preset;
                                return (
                                  <Button
                                    key={preset}
                                    type="button"
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    disabled={isDiscountDisabled}
                                    aria-pressed={isSelected}
                                    onClick={() => field.onChange(preset)}>
                                    {preset}%
                                  </Button>
                                );
                              })}
                            </div>
                          </>
                        );
                      }}
                    />
                    <FieldError errors={[errors.discountPercent]} />
                  </Field>

                  <Field
                    data-invalid={Boolean(errors.billingKind) || undefined}>
                    <FieldLabel>Cobrança</FieldLabel>
                    <Controller
                      name="billingKind"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "courtesy" || value === "return") {
                              setValue("discountPercent", 0);
                            }
                          }}
                          disabled={isPending}
                          className="flex flex-col gap-2">
                          {(
                            Object.entries(BILLING_KIND_LABELS) as [
                              BillingKind,
                              string,
                            ][]
                          ).map(([value, label]) => (
                            <div
                              key={value}
                              className="flex items-center gap-2">
                              <RadioGroupItem
                                value={value}
                                id={`billing-kind-${value}`}
                              />
                              <Label htmlFor={`billing-kind-${value}`}>
                                {label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    />
                    <FieldError errors={[errors.billingKind]} />
                  </Field>

                  {previewAmountCents != null ? (
                    <p className="text-sm text-muted-foreground">
                      Valor a cobrar:{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {formatCentsToBrl(previewAmountCents)}
                      </span>
                    </p>
                  ) : null}
                </>
              ) : null}

              {canManageFinancial ? (
                <Field data-invalid={Boolean(errors.amountBrl) || undefined}>
                  <FieldLabel htmlFor="appointment-amount-override">
                    Outro valor
                  </FieldLabel>
                  <Input
                    id="appointment-amount-override"
                    inputMode="decimal"
                    placeholder="Opcional"
                    aria-invalid={Boolean(errors.amountBrl) || undefined}
                    disabled={
                      isPending ||
                      selectedBillingKind === "courtesy" ||
                      selectedBillingKind === "return"
                    }
                    {...registerWithMask(
                      "amountBrl",
                      MASKS.currency,
                      CURRENCY_MASK_OPTIONS,
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Substitui o valor calculado com o desconto.
                  </p>
                  <FieldError errors={[errors.amountBrl]} />
                </Field>
              ) : null}
            </FieldGroup>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}>
                Cancelar
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending || isServicesEmpty}>
              {isPending ? <Spinner /> : null}
              Agendar
            </Button>
          </DialogFooter>
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
