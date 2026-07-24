"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { useUpdateClinicMutation } from "@/modules/clinics/hooks/use-clinic-settings";
import { updateClinicSchema } from "@/modules/clinics/schemas/clinic.schema";
import type { Clinic } from "@/modules/clinics/types/clinic";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

const TIMEZONE_OPTIONS = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
] as const;

type GeneralFormValues = z.input<typeof updateClinicSchema>;
type GeneralFormOutput = z.output<typeof updateClinicSchema>;

type ClinicGeneralFormProps = {
  clinic: Clinic;
};

export function ClinicGeneralForm({ clinic }: ClinicGeneralFormProps) {
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GeneralFormValues, unknown, GeneralFormOutput>({
    resolver: zodResolver(updateClinicSchema),
    defaultValues: {
      name: clinic.name,
      tradeName: clinic.tradeName ?? "",
      document: clinic.document ?? "",
      email: clinic.email ?? "",
      phone: clinic.phone ?? "",
      website: clinic.website ?? "",
      timezone: clinic.timezone,
      addressStreet: clinic.addressStreet ?? "",
      addressNumber: clinic.addressNumber ?? "",
      addressComplement: clinic.addressComplement ?? "",
      addressNeighborhood: clinic.addressNeighborhood ?? "",
      addressCity: clinic.addressCity ?? "",
      addressState: clinic.addressState ?? "",
      addressZip: clinic.addressZip ?? "",
    },
  });

  const timezone = watch("timezone");

  const updateClinic = useUpdateClinicMutation({
    onSuccess: () => {
      toast.success("Dados da clínica atualizados");
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
    updateClinic.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="settings-clinic-name">
            Nome da clínica
          </FieldLabel>
          <Input
            id="settings-clinic-name"
            autoComplete="organization"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={updateClinic.isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.tradeName) || undefined}>
            <FieldLabel htmlFor="settings-clinic-trade-name">
              Nome fantasia
            </FieldLabel>
            <Input
              id="settings-clinic-trade-name"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.tradeName) || undefined}
              disabled={updateClinic.isPending}
              {...register("tradeName")}
            />
            <FieldError errors={[errors.tradeName]} />
          </Field>

          <Field data-invalid={Boolean(errors.document) || undefined}>
            <FieldLabel htmlFor="settings-clinic-document">
              CNPJ / CPF
            </FieldLabel>
            <Input
              id="settings-clinic-document"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.document) || undefined}
              disabled={updateClinic.isPending}
              {...register("document")}
            />
            <FieldError errors={[errors.document]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.email) || undefined}>
            <FieldLabel htmlFor="settings-clinic-email">E-mail</FieldLabel>
            <Input
              id="settings-clinic-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email) || undefined}
              disabled={updateClinic.isPending}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.phone) || undefined}>
            <FieldLabel htmlFor="settings-clinic-phone">Telefone</FieldLabel>
            <Input
              id="settings-clinic-phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone) || undefined}
              disabled={updateClinic.isPending}
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.website) || undefined}>
          <FieldLabel htmlFor="settings-clinic-website">Website</FieldLabel>
          <Input
            id="settings-clinic-website"
            type="url"
            placeholder="https://"
            aria-invalid={Boolean(errors.website) || undefined}
            disabled={updateClinic.isPending}
            {...register("website")}
          />
          <FieldError errors={[errors.website]} />
        </Field>

        <Field data-invalid={Boolean(errors.timezone) || undefined}>
          <FieldLabel htmlFor="settings-clinic-timezone">
            Fuso horário
          </FieldLabel>
          <Select
            value={timezone}
            disabled={updateClinic.isPending}
            onValueChange={(value) =>
              setValue("timezone", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }>
            <SelectTrigger
              id="settings-clinic-timezone"
              className="w-full"
              aria-invalid={Boolean(errors.timezone) || undefined}>
              <SelectValue placeholder="Selecione o fuso" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.timezone]} />
        </Field>

        <Field data-invalid={Boolean(errors.addressStreet) || undefined}>
          <FieldLabel htmlFor="settings-clinic-street">Rua</FieldLabel>
          <Input
            id="settings-clinic-street"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.addressStreet) || undefined}
            disabled={updateClinic.isPending}
            {...register("addressStreet")}
          />
          <FieldError errors={[errors.addressStreet]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.addressNumber) || undefined}>
            <FieldLabel htmlFor="settings-clinic-number">Número</FieldLabel>
            <Input
              id="settings-clinic-number"
              aria-invalid={Boolean(errors.addressNumber) || undefined}
              disabled={updateClinic.isPending}
              {...register("addressNumber")}
            />
            <FieldError errors={[errors.addressNumber]} />
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.addressComplement) || undefined}>
            <FieldLabel htmlFor="settings-clinic-complement">
              Complemento
            </FieldLabel>
            <Input
              id="settings-clinic-complement"
              aria-invalid={Boolean(errors.addressComplement) || undefined}
              disabled={updateClinic.isPending}
              {...register("addressComplement")}
            />
            <FieldError errors={[errors.addressComplement]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.addressNeighborhood) || undefined}>
          <FieldLabel htmlFor="settings-clinic-neighborhood">Bairro</FieldLabel>
          <Input
            id="settings-clinic-neighborhood"
            aria-invalid={Boolean(errors.addressNeighborhood) || undefined}
            disabled={updateClinic.isPending}
            {...register("addressNeighborhood")}
          />
          <FieldError errors={[errors.addressNeighborhood]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.addressCity) || undefined}>
            <FieldLabel htmlFor="settings-clinic-city">Cidade</FieldLabel>
            <Input
              id="settings-clinic-city"
              aria-invalid={Boolean(errors.addressCity) || undefined}
              disabled={updateClinic.isPending}
              {...register("addressCity")}
            />
            <FieldError errors={[errors.addressCity]} />
          </Field>

          <Field data-invalid={Boolean(errors.addressState) || undefined}>
            <FieldLabel htmlFor="settings-clinic-state">UF</FieldLabel>
            <Input
              id="settings-clinic-state"
              maxLength={2}
              aria-invalid={Boolean(errors.addressState) || undefined}
              disabled={updateClinic.isPending}
              {...register("addressState")}
            />
            <FieldError errors={[errors.addressState]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.addressZip) || undefined}>
          <FieldLabel htmlFor="settings-clinic-zip">CEP</FieldLabel>
          <Input
            id="settings-clinic-zip"
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.addressZip) || undefined}
            disabled={updateClinic.isPending}
            {...register("addressZip")}
          />
          <FieldError errors={[errors.addressZip]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-fit" disabled={updateClinic.isPending}>
        {updateClinic.isPending ? (
          <>
            <Spinner />
            Salvando…
          </>
        ) : (
          "Salvar alterações"
        )}
      </Button>
    </form>
  );
}
