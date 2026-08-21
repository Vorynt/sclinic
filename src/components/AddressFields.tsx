"use client"

import { useRef, useState } from "react"
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetError,
  type UseFormSetValue,
} from "react-hook-form"
import { toast } from "sonner"
import { useHookFormMask } from "use-mask-input"

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { PostalAddress } from "@/core/address/types"
import { isCompleteZip, toZipDigits } from "@/core/address/zip"
import { useAddressLookup } from "@/hooks/use-address-lookup"
import {
  AppError,
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors"
import { MASK_INPUT_OPTIONS, MASKS } from "@/utils/mask"

const SET_VALUE_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
} as const

const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const

type AddressFieldName =
  | "addressZip"
  | "addressStreet"
  | "addressNumber"
  | "addressComplement"
  | "addressNeighborhood"
  | "addressCity"
  | "addressState"

type LookupLock = {
  street: boolean
  neighborhood: boolean
  city: boolean
  state: boolean
}

const UNLOCKED: LookupLock = {
  street: false,
  neighborhood: false,
  city: false,
  state: false,
}

function locksFromAddress(address: PostalAddress): LookupLock {
  return {
    street: address.street.length > 0,
    neighborhood: Boolean(address.neighborhood),
    city: address.city.length > 0,
    state: address.state.length > 0,
  }
}

function toFieldError(
  error: unknown,
): { message?: string } | undefined {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return undefined
  }

  const message = (error as { message?: unknown }).message
  return typeof message === "string" ? { message } : undefined
}

type AddressFieldsProps<TFieldValues extends FieldValues> = {
  idPrefix: string
  disabled?: boolean
  control: Control<TFieldValues>
  register: UseFormRegister<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  setError: UseFormSetError<TFieldValues>
  clearErrors: UseFormClearErrors<TFieldValues>
  errors: FieldErrors<TFieldValues>
}

function applyPostalAddress<TFieldValues extends FieldValues>(
  setValue: UseFormSetValue<TFieldValues>,
  address: PostalAddress,
) {
  setValue(
    "addressStreet" as Path<TFieldValues>,
    address.street as TFieldValues[Path<TFieldValues>],
    SET_VALUE_OPTIONS,
  )
  setValue(
    "addressNeighborhood" as Path<TFieldValues>,
    (address.neighborhood ?? "") as TFieldValues[Path<TFieldValues>],
    SET_VALUE_OPTIONS,
  )
  setValue(
    "addressCity" as Path<TFieldValues>,
    address.city as TFieldValues[Path<TFieldValues>],
    SET_VALUE_OPTIONS,
  )
  setValue(
    "addressState" as Path<TFieldValues>,
    address.state as TFieldValues[Path<TFieldValues>],
    SET_VALUE_OPTIONS,
  )
}

export function AddressFields<TFieldValues extends FieldValues>({
  idPrefix,
  disabled = false,
  control,
  register,
  setValue,
  setError,
  clearErrors,
  errors,
}: AddressFieldsProps<TFieldValues>) {
  const registerWithMask = useHookFormMask(
    register as Parameters<typeof useHookFormMask>[0],
  )
  const requestedZipRef = useRef<string | null>(null)
  const lastLookedUpZipRef = useRef<string | null>(null)
  const [lookupLock, setLookupLock] = useState<LookupLock>(UNLOCKED)

  const zipName = "addressZip" as Path<TFieldValues>
  const lookup = useAddressLookup()
  const isLookingUp = lookup.isPending

  function isFetchedFieldDisabled(locked: boolean) {
    return disabled || isLookingUp || locked
  }

  function requestLookup(rawValue: string) {
    if (disabled) {
      return
    }

    const digits = toZipDigits(rawValue)
    if (!isCompleteZip(digits)) {
      lastLookedUpZipRef.current = null
      setLookupLock((current) =>
        current.street || current.neighborhood || current.city || current.state
          ? UNLOCKED
          : current,
      )
      return
    }

    if (lastLookedUpZipRef.current === digits) {
      return
    }

    lastLookedUpZipRef.current = digits
    requestedZipRef.current = digits
    clearErrors(zipName)
    lookup.mutate(digits, {
      onSuccess: (address) => {
        if (requestedZipRef.current !== address.zip) {
          return
        }
        applyPostalAddress(setValue, address)
        setLookupLock(locksFromAddress(address))
      },
      onError: (error) => {
        if (requestedZipRef.current !== digits) {
          return
        }

        setLookupLock(UNLOCKED)

        const appError = isAppError(error)
          ? error
          : new AppError(ErrorCode.INTERNAL_ERROR, {
              message: getClientMessage(ErrorCode.INTERNAL_ERROR),
              cause: error,
            })

        if (appError.code !== ErrorCode.ADDRESS_NOT_FOUND) {
          lastLookedUpZipRef.current = null
          toast.error(appError.message)
          return
        }

        setError(zipName, { type: "lookup", message: appError.message })
      },
    })
  }

  const zipRegister = registerWithMask(
    zipName as never,
    MASKS.cep,
    MASK_INPUT_OPTIONS,
  )

  function errorOf(name: AddressFieldName) {
    return toFieldError(errors[name])
  }

  return (
    <>
      <Field data-invalid={Boolean(errorOf("addressZip")) || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-zip`}>CEP</FieldLabel>
        <div className="relative w-full min-w-0">
          <Input
            id={`${idPrefix}-zip`}
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="00000-000"
            aria-invalid={Boolean(errorOf("addressZip")) || undefined}
            aria-busy={isLookingUp || undefined}
            disabled={disabled}
            className={isLookingUp ? "pr-8" : undefined}
            {...zipRegister}
            onBlur={(event) => {
              zipRegister.onBlur(event)
              requestLookup(event.target.value)
            }}
            onChange={(event) => {
              zipRegister.onChange(event)
              requestLookup(event.target.value)
            }}
          />
          {isLookingUp ? (
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <Spinner />
            </div>
          ) : null}
        </div>
        <FieldError errors={[errorOf("addressZip")]} />
      </Field>

      <Field data-invalid={Boolean(errorOf("addressStreet")) || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-street`}>Rua</FieldLabel>
        <Input
          id={`${idPrefix}-street`}
          autoComplete="street-address"
          placeholder="Opcional"
          aria-invalid={Boolean(errorOf("addressStreet")) || undefined}
          disabled={isFetchedFieldDisabled(lookupLock.street)}
          {...register("addressStreet" as Path<TFieldValues>)}
        />
        <FieldError errors={[errorOf("addressStreet")]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={Boolean(errorOf("addressNumber")) || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-number`}>Número</FieldLabel>
          <Input
            id={`${idPrefix}-number`}
            placeholder="S/N"
            aria-invalid={Boolean(errorOf("addressNumber")) || undefined}
            disabled={disabled}
            {...register("addressNumber" as Path<TFieldValues>)}
          />
          <FieldError errors={[errorOf("addressNumber")]} />
        </Field>

        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errorOf("addressComplement")) || undefined}
        >
          <FieldLabel htmlFor={`${idPrefix}-complement`}>Complemento</FieldLabel>
          <Input
            id={`${idPrefix}-complement`}
            placeholder="Opcional"
            aria-invalid={Boolean(errorOf("addressComplement")) || undefined}
            disabled={disabled}
            {...register("addressComplement" as Path<TFieldValues>)}
          />
          <FieldError errors={[errorOf("addressComplement")]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errorOf("addressNeighborhood")) || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-neighborhood`}>Bairro</FieldLabel>
        <Input
          id={`${idPrefix}-neighborhood`}
          placeholder="Opcional"
          aria-invalid={Boolean(errorOf("addressNeighborhood")) || undefined}
          disabled={isFetchedFieldDisabled(lookupLock.neighborhood)}
          {...register("addressNeighborhood" as Path<TFieldValues>)}
        />
        <FieldError errors={[errorOf("addressNeighborhood")]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errorOf("addressCity")) || undefined}
        >
          <FieldLabel htmlFor={`${idPrefix}-city`}>Cidade</FieldLabel>
          <Input
            id={`${idPrefix}-city`}
            autoComplete="address-level2"
            placeholder="Opcional"
            aria-invalid={Boolean(errorOf("addressCity")) || undefined}
            disabled={isFetchedFieldDisabled(lookupLock.city)}
            {...register("addressCity" as Path<TFieldValues>)}
          />
          <FieldError errors={[errorOf("addressCity")]} />
        </Field>

        <Field data-invalid={Boolean(errorOf("addressState")) || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-state`}>UF</FieldLabel>
          <Controller
            control={control}
            name={"addressState" as Path<TFieldValues>}
            render={({ field }) => {
              const value =
                typeof field.value === "string" && field.value.length > 0
                  ? field.value
                  : undefined

              return (
                <Select
                  value={value}
                  onValueChange={field.onChange}
                  disabled={isFetchedFieldDisabled(lookupLock.state)}
                >
                  <SelectTrigger
                    id={`${idPrefix}-state`}
                    className="w-full"
                    aria-invalid={Boolean(errorOf("addressState")) || undefined}
                  >
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
              )
            }}
          />
          <FieldError errors={[errorOf("addressState")]} />
        </Field>
      </div>
    </>
  )
}
