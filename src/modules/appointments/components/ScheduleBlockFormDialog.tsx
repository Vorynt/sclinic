"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes } from "date-fns";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments";
import { useCreateScheduleBlockMutation } from "@/modules/appointments/hooks/use-schedule-blocks";
import { APPOINTMENT_DURATION_OPTIONS } from "@/modules/appointments/utils/calendar-constants";
import { useAuthSession } from "@/modules/authentication/hooks/use-auth";
import { ProfessionalCombobox } from "@/modules/professionals/components/ProfessionalCombobox";
import { formatProfessionalDisplayName } from "@/modules/professionals/constants/professionals";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";
import { isAppError } from "@/shared/errors";
import { parseISODate, toISODate } from "@/utils/date";

const blockFormSchema = z
  .object({
    scope: z.enum(["professional", "clinic"]),
    professionalId: z.string().optional(),
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
  })
  .superRefine((data, ctx) => {
    if (data.scope === "professional") {
      const id = data.professionalId?.trim() ?? "";
      if (!z.string().uuid().safeParse(id).success) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione um profissional",
          path: ["professionalId"],
        });
      }
    }

    const day = parseISODate(data.date);
    if (!day) return;
    const [hours, minutes] = data.startTime.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const duration = Number(data.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Duração inválida.",
        path: ["durationMinutes"],
      });
    }
  });

type BlockFormValues = z.infer<typeof blockFormSchema>;

type ScheduleBlockFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartsAt?: Date;
  defaultProfessionalId?: string | null;
};

export function ScheduleBlockFormDialog({
  open,
  onOpenChange,
  defaultStartsAt,
  defaultProfessionalId,
}: ScheduleBlockFormDialogProps) {
  const sessionQuery = useAuthSession();
  const isProfessionalLocked = isSelfScheduleOnlyRole(
    sessionQuery.data?.membership?.roleKey,
  );
  const professionalsQuery = useProfessionalsForSchedulingQuery();
  const professionals = professionalsQuery.data ?? [];

  const createMutation = useCreateScheduleBlockMutation({
    onSuccess: () => {
      toast.success("Bloqueio criado.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        isAppError(error)
          ? error.message
          : "Não foi possível criar o bloqueio.",
      );
    },
  });

  const defaultDate = defaultStartsAt ?? new Date();
  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {
      scope: "professional",
      professionalId: defaultProfessionalId ?? "",
      date: toISODate(defaultDate),
      startTime: defaultStartsAt
        ? `${String(defaultStartsAt.getHours()).padStart(2, "0")}:${String(defaultStartsAt.getMinutes()).padStart(2, "0")}`
        : "09:00",
      durationMinutes: "60",
      reason: "",
    },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const scope = watch("scope");

  useEffect(() => {
    if (!isProfessionalLocked) return;
    const selfProfessional = professionalsQuery.data?.[0];
    if (!selfProfessional) return;
    setValue("scope", "professional");
    setValue("professionalId", selfProfessional.id, { shouldValidate: true });
  }, [isProfessionalLocked, professionalsQuery.data, setValue]);

  useEffect(() => {
    if (isProfessionalLocked || !defaultProfessionalId) return;
    setValue("professionalId", defaultProfessionalId, { shouldValidate: true });
  }, [defaultProfessionalId, isProfessionalLocked, setValue]);

  const lockedProfessionalLabel = isProfessionalLocked
    ? professionals[0]
      ? formatProfessionalDisplayName({
          fullName: professionals[0].fullName,
          treatmentPronoun: professionals[0].treatmentPronoun,
        })
      : null
    : null;

  function onSubmit(data: BlockFormValues) {
    const day = parseISODate(data.date);
    if (!day) return;
    const [hours, minutes] = data.startTime.split(":").map(Number);
    const startsAt = new Date(day);
    startsAt.setHours(hours, minutes, 0, 0);
    const endsAt = addMinutes(startsAt, Number(data.durationMinutes));

    createMutation.mutate({
      professionalId:
        data.scope === "clinic" ? null : (data.professionalId ?? null),
      startsAt,
      endsAt,
      reason: data.reason?.trim() || undefined,
    });
  }

  const formKey = open
    ? `${defaultProfessionalId ?? "none"}:${defaultStartsAt?.toISOString() ?? "new"}`
    : "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Bloquear horário</DialogTitle>
          <DialogDescription>
            {isProfessionalLocked
              ? "Marca você como indisponível neste intervalo (reunião, folga, etc.)."
              : "Indisponibilidade pontual de um profissional ou da clínica inteira."}
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {!isProfessionalLocked ? (
              <Field>
                <FieldLabel>Escopo</FieldLabel>
                <Controller
                  control={control}
                  name="scope"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem
                          value="professional"
                          id="block-scope-pro"
                        />
                        Um profissional
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem
                          value="clinic"
                          id="block-scope-clinic"
                        />
                        Toda a clínica
                      </label>
                    </RadioGroup>
                  )}
                />
              </Field>
            ) : null}

            {scope === "professional" || isProfessionalLocked ? (
              <Field data-invalid={Boolean(errors.professionalId) || undefined}>
                <FieldLabel>Profissional</FieldLabel>
                <Controller
                  control={control}
                  name="professionalId"
                  render={({ field }) => (
                    <ProfessionalCombobox
                      value={field.value || ""}
                      onValueChange={(id) => field.onChange(id)}
                      displayLabel={lockedProfessionalLabel}
                      disabled={isProfessionalLocked}
                      aria-invalid={Boolean(errors.professionalId) || undefined}
                    />
                  )}
                />
                {isProfessionalLocked ? (
                  <p className="text-xs text-muted-foreground">
                    Você só pode bloquear a própria agenda.
                  </p>
                ) : null}
                <FieldError errors={[errors.professionalId]} />
              </Field>
            ) : null}

            <Field data-invalid={Boolean(errors.date) || undefined}>
              <FieldLabel>Data</FieldLabel>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
              <FieldError errors={[errors.date]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={Boolean(errors.startTime) || undefined}>
                <FieldLabel>Início</FieldLabel>
                <Input type="time" {...register("startTime")} />
                <FieldError errors={[errors.startTime]} />
              </Field>
              <Field
                data-invalid={Boolean(errors.durationMinutes) || undefined}>
                <FieldLabel>Duração</FieldLabel>
                <Controller
                  control={control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPOINTMENT_DURATION_OPTIONS.map((minutes) => (
                          <SelectItem key={minutes} value={String(minutes)}>
                            {minutes} min
                          </SelectItem>
                        ))}
                        <SelectItem value="240">240 min</SelectItem>
                        <SelectItem value="480">480 min</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.durationMinutes]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.reason) || undefined}>
              <FieldLabel>Motivo (opcional)</FieldLabel>
              <Textarea rows={2} {...register("reason")} />
              <FieldError errors={[errors.reason]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando…" : "Bloquear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
