import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const { context } = MOCK_ATTENDANCE

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

        <div className="flex flex-wrap items-center gap-2">
          {MOCK_ATTENDANCE.nav.slice(1).map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="outline"
              size="sm"
              tabIndex={-1}
            >
              {item.label}
            </Button>
          ))}
          <Button type="button" size="sm" tabIndex={-1} className="shrink-0">
            Concluir atendimento
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="flex shrink-0 flex-col gap-3 lg:w-40">
          <div className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] text-muted-foreground">Paciente</p>
            <p className="text-xs font-medium text-foreground">{context.age}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] text-muted-foreground">Motivo</p>
            <p className="text-xs text-foreground">{context.reason}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] text-muted-foreground">Últimos vitais</p>
            <p className="text-xs text-foreground">{context.lastVitals}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] text-muted-foreground">Última anotação</p>
            <p className="text-xs text-foreground">{context.lastNote}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-2 font-heading text-sm font-medium text-foreground">
            Anotações
          </p>
          <div className="min-h-36 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground">
            S — Dor lombar há 3 semanas, piora ao sentar.
          </div>
        </div>
      </div>
    </div>
  )
}
