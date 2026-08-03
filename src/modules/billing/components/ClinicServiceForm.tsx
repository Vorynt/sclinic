"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useHookFormMask } from "use-mask-input"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormErrorAlert } from "@/components/ui/form-error-alert"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateClinicServiceMutation,
  useUpdateClinicServiceMutation,
} from "@/modules/billing/hooks/use-clinic-service-mutations"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import {
  isEmptyMoneyInput,
  parseBrlToCents,
} from "@/modules/billing/utils/money"
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors"
import { CURRENCY_MASK_OPTIONS, MASKS } from "@/utils/mask"

const clinicServiceFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres"),
    description: z
      .string()
      .trim()
      .max(1000, "Descrição deve ter no máximo 1000 caracteres")
      .optional(),
    priceBrl: z.string().trim().min(1, "Preço é obrigatório"),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (isEmptyMoneyInput(data.priceBrl) || parseBrlToCents(data.priceBrl) == null) {
      ctx.addIssue({
        code: "custom",
        message: "Informe um valor válido maior que zero.",
        path: ["priceBrl"],
      })
    }
  })

type ClinicServiceFormValues = z.input<typeof clinicServiceFormSchema>
type ClinicServiceFormOutput = z.output<typeof clinicServiceFormSchema>

type ClinicServiceFormProps = {
  service?: ClinicService | null
  onSuccess?: (service: ClinicService) => void
  onCancel?: () => void
}

function centsToPriceInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function ClinicServiceForm({
  service,
  onSuccess,
  onCancel,
}: ClinicServiceFormProps) {
  const isEditing = Boolean(service)
  const [formError, setFormError] = useState<{
    message: string
    code: string
  } | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicServiceFormValues, unknown, ClinicServiceFormOutput>({
    resolver: zodResolver(clinicServiceFormSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      priceBrl: service ? centsToPriceInput(service.priceCents) : "",
      isActive: service?.isActive ?? true,
    },
  })

  const registerWithMask = useHookFormMask(register)

  function handleError(error: unknown) {
    if (isAppError(error)) {
      setFormError({ message: error.message, code: error.code })
      return
    }
    setFormError({
      message: getClientMessage(ErrorCode.INTERNAL_ERROR),
      code: ErrorCode.INTERNAL_ERROR,
    })
  }

  const createService = useCreateClinicServiceMutation({
    onSuccess: (created) => {
      toast.success("Serviço cadastrado")
      onSuccess?.(created)
    },
    onError: handleError,
  })

  const updateService = useUpdateClinicServiceMutation({
    onSuccess: (updated) => {
      toast.success("Serviço atualizado")
      onSuccess?.(updated)
    },
    onError: handleError,
  })

  const isPending = createService.isPending || updateService.isPending

  const onSubmit = handleSubmit((data) => {
    setFormError(null)
    const priceCents = parseBrlToCents(data.priceBrl)
    if (priceCents == null) return

    const description = data.description?.trim() ?? ""

    if (isEditing && service) {
      updateService.mutate({
        id: service.id,
        name: data.name,
        description: description.length === 0 ? null : description,
        priceCents,
        isActive: data.isActive,
      })
      return
    }

    createService.mutate({
      name: data.name,
      description: description.length === 0 ? undefined : description,
      priceCents,
      isActive: data.isActive,
    })
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <FormErrorAlert message={formError.message} code={formError.code} />
      ) : null}

      <FieldGroup className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="clinic-service-name">Nome</FieldLabel>
          <Input
            id="clinic-service-name"
            placeholder="Ex.: Consulta clínica geral"
            aria-invalid={Boolean(errors.name) || undefined}
            disabled={isPending}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.description) || undefined}>
          <FieldLabel htmlFor="clinic-service-description">Descrição</FieldLabel>
          <Textarea
            id="clinic-service-description"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.description) || undefined}
            disabled={isPending}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field data-invalid={Boolean(errors.priceBrl) || undefined}>
          <FieldLabel htmlFor="clinic-service-price">Preço</FieldLabel>
          <Input
            id="clinic-service-price"
            inputMode="decimal"
            placeholder="R$ 0,00"
            aria-invalid={Boolean(errors.priceBrl) || undefined}
            disabled={isPending}
            {...registerWithMask(
              "priceBrl",
              MASKS.currency,
              CURRENCY_MASK_OPTIONS,
            )}
          />
          <FieldError errors={[errors.priceBrl]} />
        </Field>

        <Field
          className="flex flex-row items-center justify-between gap-4 rounded-md border border-border px-4 py-3"
          data-invalid={Boolean(errors.isActive) || undefined}
        >
          <div className="flex flex-col gap-0.5">
            <FieldLabel htmlFor="clinic-service-active">Ativo</FieldLabel>
            <p className="text-xs text-muted-foreground">
              Serviços inativos não aparecem na agenda.
            </p>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                id="clinic-service-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isEditing ? "Salvar" : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
