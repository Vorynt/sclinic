"use client"

import { useEffect, useEffectEvent, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DataTableSearchProps = {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function DataTableSearch({
  value = "",
  onValueChange,
  placeholder = "Buscar…",
  debounceMs = 300,
  className,
}: DataTableSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const emitValueChange = useEffectEvent(onValueChange)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        emitValueChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [localValue, value, debounceMs])

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      className={cn("max-w-sm", className)}
      aria-label={placeholder}
    />
  )
}
