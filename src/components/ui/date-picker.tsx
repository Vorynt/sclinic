"use client"

import { CalendarBlankIcon, CaretDownIcon } from "@phosphor-icons/react"
import * as React from "react"
import { type Matcher } from "react-day-picker"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatISODate, parseISODate, toISODate } from "@/utils/date"

type DatePickerProps = {
  id?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
  /** Layout do caption do calendário. Preferir `dropdown` para datas de nascimento. */
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"]
  /** Primeiro mês navegável (ex.: `new Date(1900, 0)`). */
  startMonth?: Date
  /** Último mês navegável (ex.: `new Date()`). */
  endMonth?: Date
  /** Datas desabilitadas no calendário (API do react-day-picker). */
  disabledDates?: Matcher | Matcher[]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
}

function DatePicker({
  id,
  value = "",
  onChange,
  onBlur,
  placeholder = "Selecione a data",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  disabledDates,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? parseISODate(value) : undefined

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-between font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarBlankIcon className="size-4 opacity-70" />
            {selected ? formatISODate(value) : placeholder}
          </span>
          <CaretDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align={align}
      >
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDates}
          onSelect={(date) => {
            onChange?.(date ? toISODate(date) : "")
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
