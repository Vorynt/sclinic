import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MOCK_ATTENDANCE } from "@/modules/marketing/constants/mock-data"

type MockAttendanceProps = {
  className?: string
}

function severityVariant(
  severity: "high" | "medium",
): "destructive" | "secondary" {
  return severity === "high" ? "destructive" : "secondary"
}

export function MockAttendance({ className }: MockAttendanceProps) {
  const { vitals } = MOCK_ATTENDANCE

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {MOCK_ATTENDANCE.patientName}
            </h3>
            <Badge variant="outline">{MOCK_ATTENDANCE.status}</Badge>
            <Badge variant="outline">{MOCK_ATTENDANCE.type}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {MOCK_ATTENDANCE.alerts.map((alert) => (
              <Badge key={alert.label} variant={severityVariant(alert.severity)}>
                {alert.label}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground sm:text-sm">
            {MOCK_ATTENDANCE.datetime}
          </p>
        </div>

        <Button type="button" size="sm" tabIndex={-1} className="shrink-0">
          Concluir atendimento
        </Button>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-40 lg:flex-col">
          {MOCK_ATTENDANCE.nav.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-md px-2.5 py-2",
                item.active
                  ? "bg-muted"
                  : "text-muted-foreground",
              )}>
              <p
                className={cn(
                  "text-xs font-medium",
                  item.active && "text-foreground",
                )}>
                {item.label}
              </p>
              <p className="hidden text-[0.65rem] text-muted-foreground lg:block">
                {item.description}
              </p>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <p className="mb-3 font-heading text-sm font-medium text-foreground">
            Sinais vitais
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <MockField label="Pressão arterial (mmHg)">
              <div className="flex h-9 items-center overflow-hidden rounded-md border border-input bg-transparent px-3 text-sm">
                <span className="tabular-nums">{vitals.bloodPressure}</span>
              </div>
            </MockField>
            <MockField label="Frequência cardíaca (bpm)">
              <Input
                readOnly
                tabIndex={-1}
                value={vitals.heartRate}
                className="tabular-nums"
              />
            </MockField>
            <MockField label="Temperatura (°C)">
              <Input
                readOnly
                tabIndex={-1}
                value={vitals.temperature}
                className="tabular-nums"
              />
            </MockField>
            <MockField label="SpO₂ (%)">
              <Input
                readOnly
                tabIndex={-1}
                value={vitals.spo2}
                className="tabular-nums"
              />
            </MockField>
            <MockField label="Peso (kg)">
              <Input
                readOnly
                tabIndex={-1}
                value={vitals.weight}
                className="tabular-nums"
              />
            </MockField>
            <MockField label="Altura (cm)">
              <Input
                readOnly
                tabIndex={-1}
                value={vitals.height}
                className="tabular-nums"
              />
            </MockField>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            IMC estimado:{" "}
            <span className="font-medium text-foreground">{vitals.bmi}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function MockField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </div>
  )
}
