"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import {
  AFFILIATION_TYPE_LABELS,
  BRAZILIAN_STATES,
  COUNCIL_TYPE_LABELS,
  PROFESSIONAL_ROLE_KEYS,
  PROFESSIONAL_ROLE_LABELS,
  TREATMENT_PRONOUN_KEYS,
  TREATMENT_PRONOUN_LABELS,
} from "@/modules/professionals/constants/professionals";
import {
  useCreateProfessionalMutation,
  useUpdateProfessionalMutation,
} from "@/modules/professionals/hooks/use-professional-mutations";
import {
  createProfessionalSchema,
  updateProfessionalSchema,
} from "@/modules/professionals/schemas/professional.schema";
import type { ProfessionalListItem } from "@/modules/professionals/types/professional";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type CreateValues = z.input<typeof createProfessionalSchema>;
type CreateOutput = z.output<typeof createProfessionalSchema>;

type EditValues = z.input<typeof updateProfessionalSchema>;
type EditOutput = z.output<typeof updateProfessionalSchema>;

type ProfessionalFormProps = {
  professional?: ProfessionalListItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ProfessionalForm({
  professional,
  onSuccess,
  onCancel,
}: ProfessionalFormProps) {
  const isEditing = Boolean(professional);
  const [formError, setFormError] = useState<{
    message: string;
    code: string;
  } | null>(null);

  const createForm = useForm<CreateValues, unknown, CreateOutput>({
    resolver: zodResolver(createProfessionalSchema),
    defaultValues: {
      email: "",
      roleKey: "doctor",
      affiliationType: "attending",
    },
  });

  const editForm = useForm<EditValues, unknown, EditOutput>({
    resolver: zodResolver(updateProfessionalSchema),
    defaultValues: {
      id: professional?.id ?? "",
      fullName: professional?.fullName ?? "",
      treatmentPronoun: professional?.treatmentPronoun ?? undefined,
      affiliationType: professional?.affiliationType ?? "attending",
      specialty: professional?.specialty ?? "",
      councilType:
        (professional?.councilType as EditValues["councilType"]) ?? undefined,
      councilNumber: professional?.councilNumber ?? "",
      councilState: professional?.councilState ?? "",
      biography: professional?.biography ?? "",
      status: professional?.status ?? "active",
    },
  });

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code });
      return;
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    });
  }

  const createProfessional = useCreateProfessionalMutation({
    onSuccess: () => {
      toast.success("Profissional convidado por e-mail.");
      setFormError(null);
      onSuccess?.();
    },
    onError: handleError,
  });

  const updateProfessional = useUpdateProfessionalMutation({
    onSuccess: () => {
      toast.success("Profissional atualizado com sucesso");
      setFormError(null);
      onSuccess?.();
    },
    onError: handleError,
  });

  const isPending =
    createProfessional.isPending || updateProfessional.isPending;

  if (isEditing) {
    const {
      register,
      control,
      handleSubmit,
      formState: { errors },
    } = editForm;

    const onSubmit = handleSubmit((data) => {
      setFormError(null);
      updateProfessional.mutate(data);
    });

    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {formError ? (
          <FormErrorAlert message={formError.message} />
        ) : null}

        <FieldGroup className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Field
              data-invalid={Boolean(errors.treatmentPronoun) || undefined}>
              <FieldLabel>Pronome</FieldLabel>
              <Controller
                name="treatmentPronoun"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isPending}>
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

            <Field data-invalid={Boolean(errors.fullName) || undefined}>
              <FieldLabel htmlFor="professional-full-name">Nome</FieldLabel>
              <Input
                id="professional-full-name"
                autoComplete="name"
                placeholder="Nome completo"
                aria-invalid={Boolean(errors.fullName) || undefined}
                disabled={isPending}
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.affiliationType) || undefined}>
            <FieldLabel>Afiliação</FieldLabel>
            <Controller
              name="affiliationType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}>
                  <SelectTrigger
                    aria-invalid={Boolean(errors.affiliationType) || undefined}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AFFILIATION_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.affiliationType]} />
          </Field>

          <Field data-invalid={Boolean(errors.specialty) || undefined}>
            <FieldLabel htmlFor="professional-specialty">
              Especialidade
            </FieldLabel>
            <Input
              id="professional-specialty"
              placeholder="Ex.: Clínica geral"
              aria-invalid={Boolean(errors.specialty) || undefined}
              disabled={isPending}
              {...register("specialty")}
            />
            <FieldError errors={[errors.specialty]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={Boolean(errors.councilType) || undefined}>
              <FieldLabel>Conselho</FieldLabel>
              <Controller
                name="councilType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isPending}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.councilType) || undefined}>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COUNCIL_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
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
              <FieldLabel htmlFor="professional-council-number">
                Número
              </FieldLabel>
              <Input
                id="professional-council-number"
                placeholder="Registro"
                aria-invalid={Boolean(errors.councilNumber) || undefined}
                disabled={isPending}
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
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isPending}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.councilState) || undefined}>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.councilState]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.biography) || undefined}>
            <FieldLabel htmlFor="professional-biography">Biografia</FieldLabel>
            <Textarea
              id="professional-biography"
              placeholder="Breve descrição profissional"
              aria-invalid={Boolean(errors.biography) || undefined}
              disabled={isPending}
              {...register("biography")}
            />
            <FieldError errors={[errors.biography]} />
          </Field>

          <Field data-invalid={Boolean(errors.status) || undefined}>
            <FieldLabel>Status</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}>
                  <SelectTrigger
                    aria-invalid={Boolean(errors.status) || undefined}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.status]} />
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
            Salvar alterações
          </Button>
        </div>
      </form>
    );
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = createForm;

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    createProfessional.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="professional-email">E-mail</FieldLabel>
          <Input
            id="professional-email"
            type="email"
            autoComplete="email"
            placeholder="nome@clinica.com"
            aria-invalid={Boolean(errors.email) || undefined}
            disabled={isPending}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.roleKey) || undefined}>
          <FieldLabel>Papel</FieldLabel>
          <Controller
            name="roleKey"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.roleKey) || undefined}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_ROLE_KEYS.map((roleKey) => (
                    <SelectItem key={roleKey} value={roleKey}>
                      {PROFESSIONAL_ROLE_LABELS[roleKey]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.roleKey]} />
        </Field>

        <Field data-invalid={Boolean(errors.affiliationType) || undefined}>
          <FieldLabel>Afiliação</FieldLabel>
          <Controller
            name="affiliationType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.affiliationType) || undefined}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AFFILIATION_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.affiliationType]} />
        </Field>
      </FieldGroup>

      <DialogFooter className="flex justify-end gap-2">
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
          Convidar profissional
        </Button>
      </DialogFooter>
    </form>
  );
}
