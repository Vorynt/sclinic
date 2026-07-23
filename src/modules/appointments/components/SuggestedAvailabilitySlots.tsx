"use client"

import { useFormContext } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { formatSuggestedSlotLabel } from "@/modules/appointments/utils/suggested-slots"
import { toISODate } from "@/utils/date"

type SuggestedSlotFormValues = {
  date: string
  startTime: string
}

type SuggestedAvailabilitySlotsProps = {
  slots: string[]
  onSelect?: () => void
}

function toStartTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`
}

/**
 * Renders suggested free slots as chips and applies date/time via form context.
 * Must be rendered under a `FormProvider` that owns `date` and `startTime`.
 */
export function SuggestedAvailabilitySlots({
  slots,
  onSelect,
}: SuggestedAvailabilitySlotsProps) {
  const { setValue } = useFormContext<SuggestedSlotFormValues>()

  if (slots.length === 0) {
    return null
  }

  function applySlot(iso: string) {
    const slot = new Date(iso)
    if (Number.isNaN(slot.getTime())) {
      return
    }

    setValue("date", toISODate(slot), {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue("startTime", toStartTime(slot), {
      shouldValidate: true,
      shouldDirty: true,
    })
    onSelect?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">Próximos horários disponíveis</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((iso) => {
          const slot = new Date(iso)
          return (
            <Badge key={iso} asChild variant="outline" className="h-7 px-2.5">
              <button type="button" onClick={() => applySlot(iso)}>
                {formatSuggestedSlotLabel(slot)}
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
