"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { PRESCRIPTION_LAYOUT_PLACEHOLDERS } from "@/modules/medical-records/constants/prescription-layout-default"
import {
  useResetPrescriptionLayoutMutation,
  useUpsertPrescriptionLayoutMutation,
} from "@/modules/medical-records/hooks/use-prescription-mutations"
import { usePrescriptionLayoutQuery } from "@/modules/medical-records/hooks/use-prescriptions"

export function PrescriptionLayoutSettingsPanel() {
  const layoutQuery = usePrescriptionLayoutQuery()
  const [html, setHtml] = useState("")

  useEffect(() => {
    if (layoutQuery.data) {
      setHtml(layoutQuery.data.html)
    }
  }, [layoutQuery.data])

  const upsert = useUpsertPrescriptionLayoutMutation({
    onSuccess: () => toast.success("Modelo de receita salvo"),
    onError: (error) => toast.error(error.message),
  })

  const reset = useResetPrescriptionLayoutMutation({
    onSuccess: () => toast.success("Modelo padrão restaurado"),
    onError: (error) => toast.error(error.message),
  })

  if (layoutQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (layoutQuery.isError || !layoutQuery.data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar o modelo de receita.
      </p>
    )
  }

  const source = layoutQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Fonte atual:{" "}
          <span className="font-medium text-foreground">
            {source.source === "system_default"
              ? "Padrão sclinic"
              : `Customizado (versão ${source.version})`}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Use placeholders no HTML. Ao emitir uma receita, layout e dados
          demográficos são congelados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESCRIPTION_LAYOUT_PLACEHOLDERS.map((token) => (
          <code
            key={token}
            className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground"
          >
            {token}
          </code>
        ))}
      </div>

      <Textarea
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        className="min-h-96 font-mono text-xs"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={upsert.isPending || !html.trim()}
          onClick={() => upsert.mutate({ html })}
        >
          {upsert.isPending ? <Spinner data-icon="inline-start" /> : null}
          Salvar modelo customizado
        </Button>
        {source.source === "clinic_custom" ? (
          <Button
            type="button"
            variant="outline"
            disabled={reset.isPending}
            onClick={() => reset.mutate()}
          >
            Restaurar padrão sclinic
          </Button>
        ) : null}
      </div>
    </div>
  )
}
