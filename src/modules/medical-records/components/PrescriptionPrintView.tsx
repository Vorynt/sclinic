"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { usePrescriptionRenderedQuery } from "@/modules/medical-records/hooks/use-prescriptions"

type PrescriptionPrintViewProps = {
  prescriptionId: string
  /** When false, shows the document without opening the print dialog. */
  autoPrint?: boolean
}

export function PrescriptionPrintView({
  prescriptionId,
  autoPrint = true,
}: PrescriptionPrintViewProps) {
  const query = usePrescriptionRenderedQuery(prescriptionId)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!autoPrint || !query.data?.html) return

    const timer = window.setTimeout(() => {
      iframeRef.current?.contentWindow?.focus()
      iframeRef.current?.contentWindow?.print()
    }, 400)

    return () => window.clearTimeout(timer)
  }, [autoPrint, query.data?.html])

  function handlePrint() {
    iframeRef.current?.contentWindow?.focus()
    iframeRef.current?.contentWindow?.print()
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <p className="p-8 text-sm text-destructive">
        Não foi possível carregar a receita para impressão.
      </p>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-100">
      {!autoPrint ? (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 print:hidden">
          <p className="text-sm text-muted-foreground">Visualização da receita</p>
          <Button type="button" size="sm" onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        title="Receita"
        srcDoc={query.data.html}
        className="min-h-0 w-full flex-1 border-0 bg-white"
        style={{ minHeight: "100vh" }}
      />
    </div>
  )
}
