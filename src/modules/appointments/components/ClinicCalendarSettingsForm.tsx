"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AppointmentEventCard } from "@/modules/appointments/components/AppointmentEventCard";
import type { Appointment } from "@/modules/appointments/types/appointment";
import { CALENDAR_HOUR_HEIGHT_PX } from "@/modules/appointments/utils/calendar-constants";
import type { CalendarViewMode } from "@/modules/appointments/utils/calendar-range";
import { DEFAULT_CLINIC_CALENDAR_SETTINGS } from "@/modules/clinics/constants/default-calendar-settings";
import { useUpsertClinicCalendarSettingsMutation } from "@/modules/clinics/hooks/use-clinic-settings";
import { clinicCalendarSettingsSchema } from "@/modules/clinics/schemas/clinic-calendar-settings.schema";
import type {
  CalendarCardPreset,
  ClinicCalendarSettings,
} from "@/modules/clinics/types/clinic-calendar-settings";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type FormValues = z.input<typeof clinicCalendarSettingsSchema>;
type FormOutput = z.output<typeof clinicCalendarSettingsSchema>;

type ClinicCalendarSettingsFormProps = {
  initialSettings: ClinicCalendarSettings;
};

const CARD_FIELD_OPTIONS: {
  name: keyof CalendarCardPreset;
  label: string;
}[] = [
  { name: "showProfessional", label: "Profissional" },
  { name: "showType", label: "Tipo de consulta" },
  { name: "showService", label: "Serviço" },
  { name: "showModality", label: "Presencial ou online" },
  { name: "showReason", label: "Motivo" },
];

const PRESET_OPTIONS: {
  value: "operations" | "clinical";
  label: string;
}[] = [
  { value: "operations", label: "Recepção" },
  { value: "clinical", label: "Quem atende" },
];

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "day", label: "Dia" },
];

const PREVIEW_APPOINTMENT: Appointment = {
  id: "preview",
  clinicId: "preview",
  patientId: "preview-patient",
  patientName: "Ana Souza",
  professionalId: "preview-pro",
  professionalName: "Dra. Bia Lima",
  serviceId: "preview-service",
  serviceName: "Avaliação inicial",
  startsAt: new Date(2026, 7, 24, 14, 0),
  endsAt: new Date(2026, 7, 24, 14, 45),
  type: "follow_up",
  modality: "online",
  status: "confirmed",
  reason: "Retorno de rotina",
  notes: null,
  canceledAt: null,
  canceledReason: null,
  createdAt: new Date(2026, 7, 1),
  updatedAt: new Date(2026, 7, 1),
};

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-border pb-8 last:border-b-0 last:pb-0">
      <div className="flex max-w-xl flex-col gap-1">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function CardPresetEditor({
  preset,
  onChange,
}: {
  preset: CalendarCardPreset;
  onChange: (next: CalendarCardPreset) => void;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Field>
        <FieldLabel>O que mais mostrar</FieldLabel>
        <FieldDescription>
          Nome, status e horário já aparecem. Marque só o que a equipe precisa
          ver sem abrir a consulta. Consultas mais curtas mostram menos; a seta
          revela o restante.
        </FieldDescription>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CARD_FIELD_OPTIONS.map((option) => (
            <label
              key={option.name}
              className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={preset[option.name]}
                onCheckedChange={(checked) => {
                  onChange({ ...preset, [option.name]: checked === true });
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="relative min-h-28 rounded-md border bg-muted/40 p-3">
        <p className="mb-2 text-xs text-muted-foreground">Exemplo na agenda</p>
        <AppointmentEventCard
          appointment={PREVIEW_APPOINTMENT}
          variant="block"
          cardFields={preset}
          className="relative"
          style={{
            height: CALENDAR_HOUR_HEIGHT_PX / 2,
            width: "100%",
          }}
        />
      </div>
    </div>
  );
}

export function ClinicCalendarSettingsForm({
  initialSettings,
}: ClinicCalendarSettingsFormProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);
  const [presetKey, setPresetKey] = useState<"operations" | "clinical">(
    "operations",
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(clinicCalendarSettingsSchema),
    defaultValues: initialSettings,
  });

  const operationsPreset = watch("cardPresets.operations");
  const clinicalPreset = watch("cardPresets.clinical");
  const activePreset =
    (presetKey === "clinical" ? clinicalPreset : operationsPreset) ??
    DEFAULT_CLINIC_CALENDAR_SETTINGS.cardPresets[presetKey];

  const upsertSettings = useUpsertClinicCalendarSettingsMutation({
    onSuccess: () => {
      toast.success("Agenda atualizada");
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({ message: error.message, code: error.code });
        return;
      }
      setFormError({
        message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        code: ErrorCode.INTERNAL_ERROR,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    upsertSettings.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {formError ? <FormErrorAlert message={formError.message} /> : null}

      <SettingsSection
        title="Semana e horários"
        description="Vale para toda a clínica.">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.weekStartsOn) || undefined}>
            <FieldLabel>A semana começa em</FieldLabel>
            <Controller
              name="weekStartsOn"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={String(field.value)}
                  onValueChange={(value) => {
                    if (value) field.onChange(Number(value));
                  }}
                  aria-label="Primeiro dia da semana">
                  <ButtonGroup>
                    <ToggleGroupItem value="1" size="sm">
                      Segunda
                    </ToggleGroupItem>
                    <ToggleGroupItem value="0" size="sm">
                      Domingo
                    </ToggleGroupItem>
                  </ButtonGroup>
                </ToggleGroup>
              )}
            />
          </Field>

          <Field data-invalid={Boolean(errors.slotStepMinutes) || undefined}>
            <FieldLabel>Ao clicar num espaço livre</FieldLabel>
            <FieldDescription>
              O horário da nova consulta entra neste passo.
            </FieldDescription>
            <Controller
              name="slotStepMinutes"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={String(field.value)}
                  onValueChange={(value) => {
                    if (value) field.onChange(Number(value));
                  }}
                  aria-label="Passo do horário ao marcar consulta">
                  <ButtonGroup>
                    <ToggleGroupItem value="15" size="sm">
                      15 min
                    </ToggleGroupItem>
                    <ToggleGroupItem value="30" size="sm">
                      30 min
                    </ToggleGroupItem>
                  </ButtonGroup>
                </ToggleGroup>
              )}
            />
          </Field>

          <Field orientation="horizontal" className="items-start">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="show-canceled">
                Mostrar consultas canceladas
              </FieldLabel>
              <FieldDescription>
                Se desligar, elas saem da agenda. Continuam no histórico do
                paciente.
              </FieldDescription>
            </div>
            <Controller
              name="showCanceled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="show-canceled"
                  className="ml-auto"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </Field>
        </FieldGroup>
      </SettingsSection>

      <SettingsSection
        title="Ao abrir a agenda"
        description="No computador, é o que a pessoa vê primeiro. No celular, sempre abre o dia.">
        <FieldGroup>
          <Field>
            <FieldLabel>Recepção e gestão</FieldLabel>
            <Controller
              name="defaultView.operations"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  aria-label="Como a recepção abre a agenda">
                  <ButtonGroup>
                    {VIEW_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        size="sm">
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ButtonGroup>
                </ToggleGroup>
              )}
            />
          </Field>
          <Field>
            <FieldLabel>Quem atende</FieldLabel>
            <Controller
              name="defaultView.clinical"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  aria-label="Como quem atende abre a agenda">
                  <ButtonGroup>
                    {VIEW_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        size="sm">
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ButtonGroup>
                </ToggleGroup>
              )}
            />
          </Field>
        </FieldGroup>
      </SettingsSection>

      <SettingsSection
        title="O que aparece em cada consulta"
        description="Escolha o que cada grupo vê na agenda. Recepção e quem atende podem ser diferentes.">
        <div className="flex flex-col gap-5">
          <ToggleGroup
            type="single"
            variant="outline"
            value={presetKey}
            onValueChange={(value) => {
              if (value === "operations" || value === "clinical") {
                setPresetKey(value);
              }
            }}
            aria-label="Para quem vale esta escolha">
            <ButtonGroup>
              {PRESET_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  size="sm">
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ButtonGroup>
          </ToggleGroup>

          <CardPresetEditor
            preset={activePreset}
            onChange={(next) => {
              setValue(`cardPresets.${presetKey}`, next, { shouldDirty: true });
            }}
          />
        </div>
      </SettingsSection>

      <div>
        <Button type="submit" disabled={upsertSettings.isPending}>
          {upsertSettings.isPending ? <Spinner /> : null}
          Salvar
        </Button>
      </div>
    </form>
  );
}
