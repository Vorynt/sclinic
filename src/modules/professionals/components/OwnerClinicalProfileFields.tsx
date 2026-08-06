"use client";

import { useEffect, useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import type { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
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
import {
  BRAZILIAN_STATES,
  COUNCIL_TYPE_LABELS,
  PROFESSION_TYPE_DEFAULTS,
  PROFESSION_TYPE_KEYS,
  PROFESSION_TYPE_LABELS,
  TREATMENT_PRONOUN_KEYS,
  TREATMENT_PRONOUN_LABELS,
  type ProfessionTypeKey,
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
  /** When set, shows option to reuse the account display name. */
  accountName?: string;
};

export function OwnerClinicalProfileFields({
  register,
  control,
  errors,
  watch,
  setValue,
  disabled,
  idPrefix = "owner-clinical",
  accountName,
}: OwnerClinicalProfileFieldsProps) {
  const professionType = watch("professionType");
  const [useAccountName, setUseAccountName] = useState(false);
  const trimmedAccountName = accountName?.trim() ?? "";
  const canReuseAccountName = trimmedAccountName.length > 0;

  useEffect(() => {
    if (!useAccountName || !canReuseAccountName) return;
    setValue("fullName", trimmedAccountName, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [useAccountName, canReuseAccountName, trimmedAccountName, setValue]);

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
          readOnly={useAccountName}
          className={useAccountName ? "bg-muted" : undefined}
          {...register("fullName")}
        />
        <FieldError errors={[errors.fullName]} />
      </Field>

      {canReuseAccountName ? (
        <Field orientation="horizontal">
          <Checkbox
            id={`${idPrefix}-use-account-name`}
            checked={useAccountName}
            disabled={disabled}
            onCheckedChange={(checked) => {
              setUseAccountName(checked === true);
            }}
          />
          <FieldContent>
            <FieldLabel htmlFor={`${idPrefix}-use-account-name`}>
              Usar o mesmo nome da minha conta
            </FieldLabel>
          </FieldContent>
        </Field>
      ) : null}

      <Field data-invalid={Boolean(errors.professionType) || undefined}>
        <FieldLabel>Tipo de profissão</FieldLabel>
        <p className="text-sm text-muted-foreground">
          Define o perfil usado na agenda. Não altera seu papel de dono.
        </p>
        <Controller
          name="professionType"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                const next = value as ProfessionTypeKey;
                field.onChange(next);
                const defaults = PROFESSION_TYPE_DEFAULTS[next];
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
              disabled={disabled}>
              <SelectTrigger
                className="mt-2"
                aria-invalid={Boolean(errors.professionType) || undefined}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSION_TYPE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {PROFESSION_TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.professionType]} />
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
          {professionType === "nurse" ? " (área)" : ""}
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
