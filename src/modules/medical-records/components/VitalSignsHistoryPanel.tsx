"use client"

import { CaretDownIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"
import { calculateBmi } from "@/modules/medical-records/utils/bmi"
import { formatVitalSignsSummary } from "@/modules/medical-records/utils/format-vital-signs"

type VitalSignsHistoryPanelProps = {
  items: VitalSigns[] | undefined
  isLoading: boolean
  isError: boolean
}

export function VitalSignsHistoryPanel({
  items,
  isLoading,
  isError,
}: VitalSignsHistoryPanelProps) {
  return (
    <aside className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Histórico de sinais vitais
        </h3>
        <p className="text-xs text-muted-foreground">
          Medições de outros atendimentos do paciente.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar o histórico.
        </p>
      ) : null}

      {!isLoading && !isError && items && items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
          Nenhum registro anterior.
        </p>
      ) : null}

      {!isLoading && !isError && items && items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <VitalSignsHistoryItem item={item} />
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}

function VitalSignsHistoryItem({ item }: { item: VitalSigns }) {
  const [open, setOpen] = useState(false)
  const dateLabel = item.appointmentStartsAt
    ? format(item.appointmentStartsAt, "dd MMM yyyy · HH:mm", { locale: ptBR })
    : format(item.createdAt, "dd MMM yyyy · HH:mm", { locale: ptBR })
  const bmi = calculateBmi(item.weightKg, item.heightCm)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-md border border-border"
    >
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-start gap-2 px-3 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          {item.professionalName ? (
            <p className="text-xs text-muted-foreground">
              {item.professionalName}
            </p>
          ) : null}
        </div>
        <CaretDownIcon
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
        <span className="sr-only">
          {open ? "Recolher sinais vitais" : "Expandir sinais vitais"}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-border px-3 py-3">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {formatVitalSignsSummary(item).map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
            {bmi != null ? (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">IMC</dt>
                <dd className="font-medium text-foreground">{bmi}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
