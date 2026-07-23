"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useCreateClinicMutation } from "@/modules/clinics/hooks/use-create-clinic";
import { createClinicSchema } from "@/modules/clinics/schemas/clinic.schema";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type CreateClinicValues = z.input<typeof createClinicSchema>;
type CreateClinicOutput = z.output<typeof createClinicSchema>;

type CreateClinicFormProps = {
  planId: string;
};

export function CreateClinicForm({ planId }: CreateClinicFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClinicValues, unknown, CreateClinicOutput>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      tradeName: "",
      document: "",
      email: "",
      phone: "",
      addressStreet: "",
      addressNumber: "",
      addressComplement: "",
      addressNeighborhood: "",
      addressCity: "",
      addressState: "",
      addressZip: "",
      planId,
    },
  });

  const createClinic = useCreateClinicMutation({
    onSuccess: () => {
      toast.success("Clínica criada com sucesso");
      router.replace(routes.home);
    },
    onError: (error) => {
      if (isAppError(error)) {
        setFormError({
          message: error.message,
          code: error.code,
        });
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
    createClinic.mutate(data);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-lg flex-col gap-8"
      noValidate>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Cadastre sua clínica
        </h1>
        <p className="text-sm text-muted-foreground">
          Informe os dados principais. Você poderá completar o restante depois.
        </p>
      </div>

      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <input type="hidden" {...register("planId")} />

      <FieldGroup className="gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="clinic-name">Nome da clínica</FieldLabel>
          <Input
            id="clinic-name"
            autoComplete="organization"
            placeholder="Clínica Exemplo"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={createClinic.isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.tradeName) || undefined}>
          <FieldLabel htmlFor="clinic-trade-name">Nome fantasia</FieldLabel>
          <Input
            id="clinic-trade-name"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.tradeName) || undefined}
            disabled={createClinic.isPending}
            {...register("tradeName")}
          />
          <FieldError errors={[errors.tradeName]} />
        </Field>

        <Field data-invalid={Boolean(errors.document) || undefined}>
          <FieldLabel htmlFor="clinic-document">CNPJ</FieldLabel>
          <Input
            id="clinic-document"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.document) || undefined}
            disabled={createClinic.isPending}
            {...register("document")}
          />
          <FieldError errors={[errors.document]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.email) || undefined}>
            <FieldLabel htmlFor="clinic-email">E-mail</FieldLabel>
            <Input
              id="clinic-email"
              type="email"
              autoComplete="email"
              placeholder="contato@clinica.com"
              aria-invalid={Boolean(errors.email) || undefined}
              disabled={createClinic.isPending}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.phone) || undefined}>
            <FieldLabel htmlFor="clinic-phone">Telefone</FieldLabel>
            <Input
              id="clinic-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.phone) || undefined}
              disabled={createClinic.isPending}
              {...register("phone")}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.addressStreet) || undefined}>
          <FieldLabel htmlFor="clinic-street">Rua</FieldLabel>
          <Input
            id="clinic-street"
            autoComplete="street-address"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.addressStreet) || undefined}
            disabled={createClinic.isPending}
            {...register("addressStreet")}
          />
          <FieldError errors={[errors.addressStreet]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.addressNumber) || undefined}>
            <FieldLabel htmlFor="clinic-number">Número</FieldLabel>
            <Input
              id="clinic-number"
              placeholder="S/N"
              aria-invalid={Boolean(errors.addressNumber) || undefined}
              disabled={createClinic.isPending}
              {...register("addressNumber")}
            />
            <FieldError errors={[errors.addressNumber]} />
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.addressComplement) || undefined}>
            <FieldLabel htmlFor="clinic-complement">Complemento</FieldLabel>
            <Input
              id="clinic-complement"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.addressComplement) || undefined}
              disabled={createClinic.isPending}
              {...register("addressComplement")}
            />
            <FieldError errors={[errors.addressComplement]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.addressNeighborhood) || undefined}>
          <FieldLabel htmlFor="clinic-neighborhood">Bairro</FieldLabel>
          <Input
            id="clinic-neighborhood"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.addressNeighborhood) || undefined}
            disabled={createClinic.isPending}
            {...register("addressNeighborhood")}
          />
          <FieldError errors={[errors.addressNeighborhood]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.addressCity) || undefined}>
            <FieldLabel htmlFor="clinic-city">Cidade</FieldLabel>
            <Input
              id="clinic-city"
              placeholder="Opcional"
              aria-invalid={Boolean(errors.addressCity) || undefined}
              disabled={createClinic.isPending}
              {...register("addressCity")}
            />
            <FieldError errors={[errors.addressCity]} />
          </Field>

          <Field data-invalid={Boolean(errors.addressState) || undefined}>
            <FieldLabel htmlFor="clinic-state">UF</FieldLabel>
            <Input
              id="clinic-state"
              placeholder="SP"
              maxLength={2}
              aria-invalid={Boolean(errors.addressState) || undefined}
              disabled={createClinic.isPending}
              {...register("addressState")}
            />
            <FieldError errors={[errors.addressState]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.addressZip) || undefined}>
          <FieldLabel htmlFor="clinic-zip">CEP</FieldLabel>
          <Input
            id="clinic-zip"
            autoComplete="postal-code"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.addressZip) || undefined}
            disabled={createClinic.isPending}
            {...register("addressZip")}
          />
          <FieldError errors={[errors.addressZip]} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={createClinic.isPending}>
        {createClinic.isPending ? (
          <>
            <Spinner />
            Criando clínica…
          </>
        ) : (
          "Criar clínica"
        )}
      </Button>
    </form>
  );
}
