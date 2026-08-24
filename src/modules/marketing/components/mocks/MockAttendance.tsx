import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  FileTextIcon,
  PulseIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOCK_ATTENDANCE } from "@/modules/marketing/constants/mock-data"

type MockAttendanceProps = {
  className?: string
}

const ACTION_ICONS = {
  Vitais: PulseIcon,
  Documentos: FileTextIcon,
  Retorno: CalendarPlusIcon,
} as const

function severityVariant(
  severity: "high" | "medium",
): "destructive" | "warning" {
  return severity === "high" ? "destructive" : "warning"
}

export function MockAttendance({ className }: MockAttendanceProps) {
  const { context } = MOCK_ATTENDANCE

  return (
    <div
      aria-hidden="true"
      inert
      className={cn(
        "pointer-events-none flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-[0_24px_64px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent),0_0_0_1px_color-mix(in_oklch,var(--border)_80%,transparent)]",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ArrowLeftIcon className="size-3.5" />
            Voltar à agenda
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden items-center gap-2 sm:flex">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <StethoscopeIcon className="size-3" weight="bold" />
            </span>
            <span className="font-heading text-xs font-semibold tracking-tight">
              Atendimento
            </span>
          </span>
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {MOCK_ATTENDANCE.patientName}
              </h3>
              <Badge variant="outline">{MOCK_ATTENDANCE.status}</Badge>
              <Badge variant="outline">{MOCK_ATTENDANCE.type}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {MOCK_ATTENDANCE.alerts.map((alert) => (
                <Badge
                  key={alert.label}
                  variant={severityVariant(alert.severity)}
                >
                  {alert.label}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {MOCK_ATTENDANCE.datetime}
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {MOCK_ATTENDANCE.actions.map((item) => {
              const Icon = ACTION_ICONS[item.label as keyof typeof ACTION_ICONS]
              return (
                <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  tabIndex={-1}
                >
                  {Icon ? <Icon /> : null}
                  {item.label}
                </Button>
              )
            })}
            <Button type="button" size="sm" tabIndex={-1} className="shrink-0">
              Concluir atendimento
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <aside className="flex shrink-0 flex-col gap-3 lg:w-40">
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-xs font-semibold text-foreground">
                Paciente
              </p>
              <p className="text-xs text-muted-foreground">{context.age}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.65rem] text-muted-foreground">Motivo</p>
              <p className="text-xs text-foreground">{context.reason}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[0.65rem] text-muted-foreground">
                Sinais vitais
              </p>
              <div className="rounded-md border border-border px-2.5 py-1.5">
                <p className="text-[0.6rem] text-muted-foreground">
                  Nesta consulta
                </p>
                <p className="text-xs text-foreground">{context.lastVitals}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.65rem] text-muted-foreground">
                Última anotação
              </p>
              <p className="text-xs text-foreground">{context.lastNote}</p>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <p className="mb-2 font-heading text-sm font-medium text-foreground">
              Anotações
            </p>
            <div className="min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground">
              S — Dor lombar há 3 semanas, piora ao sentar.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
