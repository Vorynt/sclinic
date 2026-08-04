"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { useCreateClinicMutation } from "@/modules/clinics/hooks/use-create-clinic";
import { createClinicSchema } from "@/modules/clinics/schemas/clinic.schema";
import {
  BRAZILIAN_STATES,
  COUNCIL_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
  TREATMENT_PRONOUN_KEYS,
  TREATMENT_PRONOUN_LABELS,
  type ProfessionalRoleKey,
} from "@/modules/professionals/constants/professionals";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type CreateClinicValues = z.input<typeof createClinicSchema>;
type CreateClinicOutput = z.output<typeof createClinicSchema>;

type CreateClinicFormProps = {
  planId: string;
};

const CREATE_CLINIC_FORM_ID = "create-clinic-form";

const PRACTICE_DEFAULTS: Record<
  ProfessionalRoleKey,
  { councilType: "CRM" | "COREN"; treatmentPronoun: "dr" | "enf" }
> = {
  doctor: { councilType: "CRM", treatmentPronoun: "dr" },
  nurse: { councilType: "COREN", treatmentPronoun: "enf" },
};

export function CreateClinicForm({ planId }: CreateClinicFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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
      alsoPractices: false,
      clinicalPracticeType: undefined,
      fullName: "",
      treatmentPronoun: undefined,
      councilType: undefined,
      councilNumber: "",
      councilState: "",
      specialty: "",
    },
  });

  const alsoPractices = watch("alsoPractices");

  const createClinic = useCreateClinicMutation({
    onSuccess: () => {
      toast.success("Clínica criada com sucesso");
      router.replace(routes.onboardingHours);
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

  const onSubmit = handleSubmit(
    (data) => {
      setFormError(null);
      if (!data.alsoPractices) {
        createClinic.mutate({
          ...data,
          alsoPractices: false,
          clinicalPracticeType: undefined,
          fullName: undefined,
          treatmentPronoun: undefined,
          councilType: undefined,
          councilNumber: undefined,
          councilState: undefined,
          specialty: undefined,
        });
        return;
      }
      createClinic.mutate(data);
    },
    () => {
      scrollFormToTop(document.getElementById(CREATE_CLINIC_FORM_ID));
    },
  );

  return (
    <form
      id={CREATE_CLINIC_FORM_ID}
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-8"
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
        <FormErrorAlert message={formError.message} />
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

      <section className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Você também atende pacientes nesta clínica?
          </h2>
          <p className="text-sm text-muted-foreground">
            Marque se <strong>você</strong> realiza consultas ou procedimentos.
            Isso cria um <strong>perfil clínico</strong> vinculado à sua conta
            para você aparecer na agenda.{" "}
            <strong>Seu papel de dono da clínica não muda</strong> — você
            continua administrando a clínica e a assinatura.
          </p>
        </div>

        <Controller
          name="alsoPractices"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value ? "yes" : "no"}
              onValueChange={(value) => {
                const next = value === "yes";
                field.onChange(next);
                if (!next) {
                  setValue("fullName", "");
                  setValue("clinicalPracticeType", undefined);
                  setValue("treatmentPronoun", undefined);
                  setValue("councilType", undefined);
                  setValue("councilNumber", "");
                  setValue("councilState", "");
                  setValue("specialty", "");
                }
              }}
              disabled={createClinic.isPending}
              className="gap-3">
              <Label
                htmlFor="also-practices-no"
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 has-data-[state=checked]:border-primary">
                <RadioGroupItem
                  id="also-practices-no"
                  value="no"
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium">Não</span> — só administro a
                  clínica (gestão / recepção)
                </span>
              </Label>
              <Label
                htmlFor="also-practices-yes"
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 has-data-[state=checked]:border-primary">
                <RadioGroupItem
                  id="also-practices-yes"
                  value="yes"
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium">Sim</span> — eu também atendo
                  pacientes
                </span>
              </Label>
            </RadioGroup>
          )}
        />

        {alsoPractices ? (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <Field data-invalid={Boolean(errors.fullName) || undefined}>
              <FieldLabel htmlFor="owner-full-name">
                Nome completo na agenda
              </FieldLabel>
              <Input
                id="owner-full-name"
                autoComplete="name"
                placeholder="Como você aparece nos agendamentos"
                aria-invalid={Boolean(errors.fullName) || undefined}
                disabled={createClinic.isPending}
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field
              data-invalid={Boolean(errors.clinicalPracticeType) || undefined}>
              <FieldLabel>Tipo de atuação clínica</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Define o perfil usado na agenda. Não altera seu papel de dono.
              </p>
              <Controller
                name="clinicalPracticeType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      const next = value as ProfessionalRoleKey;
                      field.onChange(next);
                      const defaults = PRACTICE_DEFAULTS[next];
                      if (defaults) {
                        setValue("councilType", defaults.councilType, {
                          shouldDirty: true,
                        });
                        if (!watch("treatmentPronoun")) {
                          setValue(
                            "treatmentPronoun",
                            defaults.treatmentPronoun,
                            { shouldDirty: true },
                          );
                        }
                      }
                    }}
                    disabled={createClinic.isPending}
                    className="mt-2 gap-3">
                    {(
                      Object.keys(
                        PROFESSIONAL_ROLE_LABELS,
                      ) as ProfessionalRoleKey[]
                    ).map((key) => (
                      <Label
                        key={key}
                        htmlFor={`practice-${key}`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 has-data-[state=checked]:border-primary">
                        <RadioGroupItem id={`practice-${key}`} value={key} />
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
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={createClinic.isPending}>
                    <SelectTrigger
                      aria-invalid={
                        Boolean(errors.treatmentPronoun) || undefined
                      }>
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
                      disabled={createClinic.isPending}>
                      <SelectTrigger
                        aria-invalid={Boolean(errors.councilType) || undefined}>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COUNCIL_TYPE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.councilType]} />
              </Field>

              <Field data-invalid={Boolean(errors.councilNumber) || undefined}>
                <FieldLabel htmlFor="owner-council-number">Número</FieldLabel>
                <Input
                  id="owner-council-number"
                  placeholder="Opcional"
                  aria-invalid={Boolean(errors.councilNumber) || undefined}
                  disabled={createClinic.isPending}
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
                      disabled={createClinic.isPending}>
                      <SelectTrigger
                        aria-invalid={
                          Boolean(errors.councilState) || undefined
                        }>
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
              <FieldLabel htmlFor="owner-specialty">Especialidade</FieldLabel>
              <Input
                id="owner-specialty"
                placeholder="Opcional"
                aria-invalid={Boolean(errors.specialty) || undefined}
                disabled={createClinic.isPending}
                {...register("specialty")}
              />
              <FieldError errors={[errors.specialty]} />
            </Field>
          </div>
        ) : null}
      </section>

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
