"use client"

import { CalendarBlankIcon, CaretDownIcon } from "@phosphor-icons/react"
import * as React from "react"
import { type DateRange, type Matcher } from "react-day-picker"
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

export type DateRangeValue = {
  from?: string
  to?: string
}

type DateRangePickerProps = {
  id?: string
  value?: DateRangeValue
  onChange?: (value: DateRangeValue) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"]
  startMonth?: Date
  endMonth?: Date
  disabledDates?: Matcher | Matcher[]
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  numberOfMonths?: number
  modal?: boolean
}

function DateRangePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione o período",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  disabledDates,
  align = "start",
  side = "bottom",
  numberOfMonths = 2,
  modal = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const fromDate = value?.from ? parseISODate(value.from) : undefined
  const toDate = value?.to ? parseISODate(value.to) : undefined
  const selected: DateRange | undefined = fromDate
    ? { from: fromDate, to: toDate }
    : undefined

  const label =
    value?.from && value?.to
      ? `${formatISODate(value.from)} – ${formatISODate(value.to)}`
      : value?.from
        ? `${formatISODate(value.from)} – …`
        : placeholder

  return (
    <Popover modal={modal} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!fromDate}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-between font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <CalendarBlankIcon className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{label}</span>
          </span>
          <CaretDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        collisionPadding={16}
        className="z-60 w-auto overflow-hidden p-0"
      >
        <Calendar
          mode="range"
          locale={ptBR}
          selected={selected}
          defaultMonth={fromDate ?? toDate}
          captionLayout={captionLayout}
          numberOfMonths={numberOfMonths}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDates}
          onSelect={(range) => {
            if (!range?.from) {
              onChange?.({})
              return
            }
            onChange?.({
              from: toISODate(range.from),
              to: range.to ? toISODate(range.to) : undefined,
            })
            if (range.from && range.to) {
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
export type { DateRangePickerProps }
