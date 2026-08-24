import {
  DownloadSimpleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  MOCK_BILLING_CHARGES,
  MOCK_BILLING_SUMMARY,
} from "@/modules/marketing/constants/mock-data"

type MockBillingProps = {
  className?: string
}

function chargeBadgeVariant(
  status: "paid" | "pending" | "canceled",
): "success" | "warning" | "secondary" {
  if (status === "paid") return "success"
  if (status === "pending") return "warning"
  return "secondary"
}

export function MockBilling({ className }: MockBillingProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-heading text-base font-semibold tracking-tight text-foreground">
            Faturamento
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Cobranças da clínica por consulta.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Button type="button" variant="outline" size="sm" tabIndex={-1}>
            <PrinterIcon data-icon="inline-start" />
            Imprimir
          </Button>
          <Button type="button" size="sm" tabIndex={-1}>
            <DownloadSimpleIcon data-icon="inline-start" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            tabIndex={-1}
            placeholder="Buscar por paciente"
            className="h-8 pl-8 text-sm"
            aria-label="Buscar por paciente"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-lg border border-input bg-background px-2.5 text-xs text-foreground">
            Este mês
          </span>
          <Button type="button" variant="outline" size="sm" tabIndex={-1} className="h-8">
            <FunnelIcon />
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_BILLING_SUMMARY.map((item) => (
          <Card key={item.label} size="sm">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-lg tabular-nums tracking-tight">
                {item.value}
              </CardTitle>
              <CardDescription>{item.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_BILLING_CHARGES.map((charge) => (
              <TableRow key={`${charge.patientName}-${charge.date}`}>
                <TableCell>
                  <p className="truncate text-sm font-medium text-foreground">
                    {charge.patientName}
                  </p>
                  <p className="truncate text-[0.65rem] text-muted-foreground">
                    {charge.description}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={chargeBadgeVariant(charge.status)}>
                    {charge.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  {charge.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
