"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BILLING_KIND_LABELS } from "@/modules/billing/constants/charges";
import {
  computeChargeAmountCents,
  type BillingKind,
} from "@/modules/billing/utils/charge-pricing";
import {
  formatCentsToBrl,
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money";
import { CURRENCY_MASK_OPTIONS, MASKS } from "@/utils/mask";

const DISCOUNT_PRESETS = [5, 10, 15, 20, 50] as const;

type AppointmentBillingFormValues = {
  discountPercent: number;
  billingKind: BillingKind;
  amountBrl?: string;
};

type AppointmentFormBillingFieldsProps = {
  isPending: boolean;
  canManageFinancial: boolean;
  listAmountCents: number | null;
};

export function AppointmentFormBillingFields({
  isPending,
  canManageFinancial,
  listAmountCents,
}: AppointmentFormBillingFieldsProps) {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<AppointmentBillingFormValues>();
  const registerWithMask = useHookFormMask(register);

  const selectedDiscount = watch("discountPercent");
  const selectedBillingKind = watch("billingKind");
  const selectedOverrideBrl = watch("amountBrl") ?? "";

  const previewAmountCents =
    listAmountCents != null
      ? computeChargeAmountCents({
          listAmountCents,
          discountPercent: Number(selectedDiscount) || 0,
          billingKind: selectedBillingKind,
          amountCentsOverride:
            canManageFinancial && !isEmptyMoneyInput(selectedOverrideBrl)
              ? (parseBrlToCents(selectedOverrideBrl) ?? undefined)
              : undefined,
        })
      : null;

  return (
    <FieldSet>
      <FieldLegend>Cobrança</FieldLegend>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.discountPercent) || undefined}>
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
                    step={1}
                    value={[discountValue]}
                    disabled={isDiscountDisabled}
                    aria-invalid={Boolean(errors.discountPercent) || undefined}
                    onValueChange={([value]) => field.onChange(value ?? 0)}
                  />
                  <ToggleGroup
                    type="single"
                    className="flex flex-wrap gap-2"
                    value={String(discountValue)}
                    onValueChange={(value) => field.onChange(value ?? 0)}>
                    {DISCOUNT_PRESETS.map((preset) => {
                      const isSelected = discountValue === preset;
                      return (
                        <ToggleGroupItem
                          value={String(preset)}
                          key={preset}
                          size="sm"
                          variant="outline"
                          disabled={isDiscountDisabled}
                          aria-pressed={isSelected}>
                          {preset}%
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </>
              );
            }}
          />
          <FieldError errors={[errors.discountPercent]} />
        </Field>

        <Field data-invalid={Boolean(errors.billingKind) || undefined}>
          <FieldLabel>Tipo de cobrança</FieldLabel>
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
                  Object.entries(BILLING_KIND_LABELS) as [BillingKind, string][]
                ).map(([value, label]) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={value}
                      id={`billing-kind-${value}`}
                    />
                    <Label htmlFor={`billing-kind-${value}`}>{label}</Label>
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
            <FieldDescription>
              Substitui o valor calculado com o desconto.
            </FieldDescription>
            <FieldError errors={[errors.amountBrl]} />
          </Field>
        ) : null}
      </FieldGroup>
    </FieldSet>
  );
}
