"use client";

import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { z } from "zod";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import {
  BRAZILIAN_STATES,
  COUNCIL_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
  TREATMENT_PRONOUN_KEYS,
  TREATMENT_PRONOUN_LABELS,
  type ProfessionalRoleKey,
} from "@/modules/professionals/constants/professionals";
import { createOwnerClinicalProfileSchema } from "@/modules/professionals/schemas/owner-clinical-profile.schema";

export type OwnerClinicalProfileFormValues = z.input<
  typeof createOwnerClinicalProfileSchema
>;

type OwnerClinicalProfileFieldsProps = {
  register: UseFormRegister<OwnerClinicalProfileFormValues>;
  control: Control<OwnerClinicalProfileFormValues>;
  errors: FieldErrors<OwnerClinicalProfileFormValues>;
  watch: UseFormWatch<OwnerClinicalProfileFormValues>;
  setValue: UseFormSetValue<OwnerClinicalProfileFormValues>;
  disabled?: boolean;
  idPrefix?: string;
};

const PRACTICE_DEFAULTS: Record<
  ProfessionalRoleKey,
  { councilType: "CRM" | "COREN"; treatmentPronoun: "dr" | "enf" }
> = {
  doctor: { councilType: "CRM", treatmentPronoun: "dr" },
  nurse: { councilType: "COREN", treatmentPronoun: "enf" },
};

export function OwnerClinicalProfileFields({
  register,
  control,
  errors,
  watch,
  setValue,
  disabled,
  idPrefix = "owner-clinical",
}: OwnerClinicalProfileFieldsProps) {
  const practiceType = watch("clinicalPracticeType");

  return (
    <div className="flex flex-col gap-4">
      <Field data-invalid={Boolean(errors.fullName) || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-full-name`}>
          Nome completo na agenda
        </FieldLabel>
        <Input
          id={`${idPrefix}-full-name`}
          autoComplete="name"
          placeholder="Como você aparece nos agendamentos"
          aria-invalid={Boolean(errors.fullName) || undefined}
          disabled={disabled}
          {...register("fullName")}
        />
        <FieldError errors={[errors.fullName]} />
      </Field>
      <Field data-invalid={Boolean(errors.clinicalPracticeType) || undefined}>
        <FieldLabel>Tipo de atuação clínica</FieldLabel>
        <p className="text-sm text-muted-foreground">
          Define o perfil usado na agenda. Não altera seu papel de dono.
        </p>
        <Controller
          name="clinicalPracticeType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) => {
                const next = value as ProfessionalRoleKey;
                field.onChange(next);
                const defaults = PRACTICE_DEFAULTS[next];
                if (defaults) {
                  setValue("councilType", defaults.councilType, {
                    shouldDirty: true,
                  });
                  const currentPronoun = watch("treatmentPronoun");
                  if (!currentPronoun) {
                    setValue("treatmentPronoun", defaults.treatmentPronoun, {
                      shouldDirty: true,
                    });
                  }
                }
              }}
              disabled={disabled}
              className="mt-2 gap-3">
              {(
                Object.keys(PROFESSIONAL_ROLE_LABELS) as ProfessionalRoleKey[]
              ).map((key) => (
                <Label
                  key={key}
                  htmlFor={`${idPrefix}-practice-${key}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 has-data-[state=checked]:border-primary">
                  <RadioGroupItem
                    id={`${idPrefix}-practice-${key}`}
                    value={key}
                  />
                  <span className="text-sm font-medium">
                    {PROFESSIONAL_ROLE_LABELS[key]}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
        <FieldError errors={[errors.clinicalPracticeType]} />
      </Field>

      <Field data-invalid={Boolean(errors.treatmentPronoun) || undefined}>
        <FieldLabel>Pronome de tratamento</FieldLabel>
        <Controller
          name="treatmentPronoun"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}>
              <SelectTrigger
                aria-invalid={Boolean(errors.treatmentPronoun) || undefined}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_PRONOUN_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {TREATMENT_PRONOUN_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.treatmentPronoun]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={Boolean(errors.councilType) || undefined}>
          <FieldLabel>Conselho</FieldLabel>
          <Controller
            name="councilType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value === "" ? undefined : value)
                }
                disabled={disabled}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.councilType) || undefined}>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNCIL_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.councilType]} />
        </Field>

        <Field data-invalid={Boolean(errors.councilNumber) || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-council-number`}>Número</FieldLabel>
          <Input
            id={`${idPrefix}-council-number`}
            placeholder="Opcional"
            aria-invalid={Boolean(errors.councilNumber) || undefined}
            disabled={disabled}
            {...register("councilNumber")}
          />
          <FieldError errors={[errors.councilNumber]} />
        </Field>

        <Field data-invalid={Boolean(errors.councilState) || undefined}>
          <FieldLabel>UF</FieldLabel>
          <Controller
            name="councilState"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value === "" ? undefined : value)
                }
                disabled={disabled}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.councilState) || undefined}>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.councilState]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.specialty) || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-specialty`}>
          Especialidade
          {practiceType === "nurse" ? " (área)" : ""}
        </FieldLabel>
        <Input
          id={`${idPrefix}-specialty`}
          placeholder="Opcional"
          aria-invalid={Boolean(errors.specialty) || undefined}
          disabled={disabled}
          {...register("specialty")}
        />
        <FieldError errors={[errors.specialty]} />
      </Field>
    </div>
  );
}
