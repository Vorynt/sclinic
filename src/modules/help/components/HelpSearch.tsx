"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"

type HelpSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function HelpSearch({ value, onChange }: HelpSearchProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ex.: marcar consulta, convidar equipe, receita…"
        className="h-11 pl-9"
        aria-label="Buscar na ajuda"
      />
    </div>
  )
}
