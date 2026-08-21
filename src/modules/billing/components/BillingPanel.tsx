"use client"

import { DownloadSimpleIcon, PrinterIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { routes } from "@/config/routes"
import { exportChargesAction } from "@/modules/billing/actions/export-charges"
import { BillingCharts } from "@/modules/billing/components/BillingCharts"
import { BillingSummaryCards } from "@/modules/billing/components/BillingSummaryCards"
import { ChargeFiltersBar } from "@/modules/billing/components/ChargeFiltersBar"
import { ChargesTable } from "@/modules/billing/components/ChargesTable"
import { useChargeListFilters } from "@/modules/billing/hooks/use-charge-list-filters"
import { useBillingInsightsQuery } from "@/modules/billing/hooks/use-charges"
import { downloadCsv } from "@/modules/billing/utils/download-csv"

export function BillingPanel() {
  const filters = useChargeListFilters()
  const insightsQuery = useBillingInsightsQuery(filters.chargeFilters)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (isExporting) return
    setIsExporting(true)
    try {
      const result = await exportChargesAction(filters.chargeFilters)
      if (!result.success) {
        toast.error(result.error.message)
        return
      }
      downloadCsv(result.data.filename, result.data.csv)
      toast.success("CSV exportado")
    } finally {
      setIsExporting(false)
    }
  }

  function handlePrint() {
    const params = new URLSearchParams(window.location.search)
    params.delete("page")
    const search = params.toString()
    window.open(
      search ? `${routes.billingPrint}?${search}` : routes.billingPrint,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faturamento"
        description="Cobranças da clínica por consulta — acompanhe recebidos, pendências e inadimplência."
        actions={[
          {
            id: "print",
            label: "Imprimir",
            icon: PrinterIcon,
            priority: "secondary",
            onClick: handlePrint,
          },
          {
            id: "export-csv",
            label: isExporting ? "Exportando…" : "Exportar CSV",
            icon: DownloadSimpleIcon,
            priority: "primary",
            onClick: () => {
              void handleExport()
            },
          },
        ]}
      />

      <ChargeFiltersBar
        filters={filters}
        period={insightsQuery.data?.period}
      />

      <BillingSummaryCards filters={filters.chargeFilters} />

      <BillingCharts filters={filters.chargeFilters} />

      <ChargesTable
        filters={filters.listFilters}
        onPageChange={filters.setPage}
      />
    </div>
  )
}
