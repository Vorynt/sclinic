"use client";

import {
  CalendarBlankIcon,
  CaretDownIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  EnvelopeSimpleIcon,
  HeartbeatIcon,
  HospitalIcon,
  NotePencilIcon,
  StethoscopeIcon,
  UserIcon,
  UsersThreeIcon,
  WarningCircleIcon,
  WarningIcon,
  type Icon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit";
import { useAuditLogsQuery } from "@/modules/audit/hooks/use-audit";
import {
  dayOfWeekLabel,
  diffClinicWeeklyHours,
  formatClinicDaySchedule,
  isClinicWeeklyHours,
  summarizeClinicHoursChanges,
} from "@/modules/audit/mappers/audit-hours-changes.mapper";
import type { ListAuditLogsInput } from "@/modules/audit/schemas/audit.schema";
import type { AuditLog } from "@/modules/audit/types/audit";
import { DAY_OF_WEEK_DISPLAY_ORDER } from "@/modules/clinics/types/clinic-hours";
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators";
import { cva } from "class-variance-authority";

type AuditLogsTableProps = {
  filters: ListAuditLogsInput;
  onPageChange: (page: number) => void;
};

const ENTITY_ICONS: Record<string, Icon> = {
  [AUDIT_ENTITY_TYPES.PATIENT]: UserIcon,
  [AUDIT_ENTITY_TYPES.APPOINTMENT]: CalendarBlankIcon,
  [AUDIT_ENTITY_TYPES.CLINIC]: HospitalIcon,
  [AUDIT_ENTITY_TYPES.CLINIC_HOURS]: ClockIcon,
  [AUDIT_ENTITY_TYPES.MEMBER]: UsersThreeIcon,
  [AUDIT_ENTITY_TYPES.INVITATION]: EnvelopeSimpleIcon,
  [AUDIT_ENTITY_TYPES.CHARGE]: CurrencyCircleDollarIcon,
  [AUDIT_ENTITY_TYPES.CLINICAL_NOTE]: NotePencilIcon,
  [AUDIT_ENTITY_TYPES.VITAL_SIGNS]: HeartbeatIcon,
  [AUDIT_ENTITY_TYPES.CLINICAL_ALERT]: WarningIcon,
  [AUDIT_ENTITY_TYPES.PROFESSIONAL]: StethoscopeIcon,
};

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  cpf: "CPF",
  birthDate: "Nascimento",
  status: "Status",
  roleKey: "Papel",
  timezone: "Fuso horário",
  tradeName: "Nome fantasia",
  patientName: "Paciente",
  professionalName: "Profissional",
  startsAt: "Início",
  endsAt: "Fim",
  type: "Tipo",
  canceledReason: "Motivo do cancelamento",
};

function actionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

function entityLabel(entityType: string): string {
  return AUDIT_ENTITY_LABELS[entityType] ?? entityType;
}

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return JSON.stringify(value);
}

function summarizeChanges(log: AuditLog): string {
  if (log.status === "error" && log.errorMessage) {
    return log.errorMessage;
  }

  const changes = log.changes;
  if (!changes) return "Sem detalhes adicionais";

  const before = changes.before;
  const after = changes.after;

  const hoursSummary = summarizeClinicHoursChanges(before, after);
  if (hoursSummary) return hoursSummary;

  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;
    const keys = new Set([
      ...Object.keys(beforeRecord),
      ...Object.keys(afterRecord),
    ]);
    const changed: string[] = [];
    for (const key of keys) {
      if (
        JSON.stringify(beforeRecord[key]) !== JSON.stringify(afterRecord[key])
      ) {
        changed.push(fieldLabel(key));
      }
    }
    if (changed.length > 0) {
      return `Alterou: ${changed.slice(0, 4).join(", ")}${changed.length > 4 ? "…" : ""}`;
    }
  }

  if (after && typeof after === "object" && !Array.isArray(after)) {
    const afterRecord = after as Record<string, unknown>;
    const name =
      (afterRecord.name as string | undefined) ??
      (afterRecord.email as string | undefined) ??
      (afterRecord.patientName as string | undefined);
    if (name) return String(name);
  }

  return "Registro atualizado";
}

const statusBadgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      status: {
        success: "bg-green-500/20 text-green-500",
        error: "bg-red-500/20 text-red-500",
      },
    },
    defaultVariants: {
      status: "success",
    },
  },
);

function StatusBadge({ status }: { status: AuditLog["status"] }) {
  const isSuccess = status === "success";
  const Icon = isSuccess ? CheckCircleIcon : WarningCircleIcon;

  return (
    <Badge
      variant={isSuccess ? "outline" : "destructive"}
      className={statusBadgeVariants({ status })}>
      <Icon aria-hidden />
      {isSuccess ? "Sucesso" : "Erro"}
    </Badge>
  );
}

function ClinicHoursChangesDetail({
  before,
  after,
}: {
  before: unknown;
  after: unknown;
}) {
  if (isClinicWeeklyHours(before) && isClinicWeeklyHours(after)) {
    const diffs = diffClinicWeeklyHours(before, after);

    if (diffs.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Nenhuma diferença detectada.
        </p>
      );
    }

    return (
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Dia</th>
              <th className="px-3 py-2 font-medium">Antes</th>
              <th className="px-3 py-2 font-medium">Depois</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((diff) => (
              <tr key={diff.dayOfWeek} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">
                  {diff.dayLabel}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {diff.beforeLabel}
                </td>
                <td className="px-3 py-2 text-foreground">{diff.afterLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isClinicWeeklyHours(after)) {
    const byDay = new Map(after.map((day) => [day.dayOfWeek, day]))
    const ordered = DAY_OF_WEEK_DISPLAY_ORDER.map(
      (dayOfWeek) =>
        byDay.get(dayOfWeek) ?? {
          dayOfWeek,
          isClosed: true,
          intervals: [],
        },
    )

    return (
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Dia</th>
              <th className="px-3 py-2 font-medium">Horário</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((day) => (
              <tr key={day.dayOfWeek} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">
                  {dayOfWeekLabel(day.dayOfWeek)}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatClinicDaySchedule(day)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function ChangesDetail({ log }: { log: AuditLog }) {
  if (log.status === "error") {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        <p className="font-medium">Falha na operação</p>
        <p className="mt-1 text-destructive/90">
          {log.errorMessage ?? "Erro desconhecido"}
        </p>
        {log.errorCode ? (
          <p className="mt-1 font-mono text-xs text-destructive/70">
            {log.errorCode}
          </p>
        ) : null}
      </div>
    );
  }

  const changes = log.changes;
  if (!changes) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem detalhes de alteração.
      </p>
    );
  }

  const before = changes.before;
  const after = changes.after;

  if (isClinicWeeklyHours(after) || isClinicWeeklyHours(before)) {
    return <ClinicHoursChangesDetail before={before} after={after} />;
  }

  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;
    const keys = [...new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)])]
      .filter(
        (key) =>
          JSON.stringify(beforeRecord[key]) !==
          JSON.stringify(afterRecord[key]),
      )
      .sort();

    if (keys.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Nenhuma diferença detectada.
        </p>
      );
    }

    return (
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Campo</th>
              <th className="px-3 py-2 font-medium">Antes</th>
              <th className="px-3 py-2 font-medium">Depois</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">
                  {fieldLabel(key)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatValue(beforeRecord[key])}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {formatValue(afterRecord[key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (after && typeof after === "object" && !Array.isArray(after)) {
    const entries = Object.entries(after as Record<string, unknown>);
    return (
      <dl className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{fieldLabel(key)}</dt>
            <dd className="truncate text-foreground">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (before) {
    return (
      <p className="text-sm text-muted-foreground">
        Registro removido ou desativado.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">Sem detalhes de alteração.</p>
  );
}

function AuditLogCard({ log }: { log: AuditLog }) {
  const EntityIcon = ENTITY_ICONS[log.entityType] ?? HospitalIcon;

  return (
    <Collapsible className="group/audit-card rounded-lg border border-border bg-card">
      <CollapsibleTrigger className="flex w-full items-start gap-3 p-4 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <EntityIcon className="size-5" weight="duotone" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">
              {actionLabel(log.action)}
            </p>
            <StatusBadge status={log.status} />
            <Badge variant="outline">{entityLabel(log.entityType)}</Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {summarizeChanges(log)}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              {format(log.createdAt, "dd MMM yyyy · HH:mm", { locale: ptBR })}
            </span>
            <span className="truncate">
              {log.actorName ?? log.actorEmail ?? "Sistema"}
            </span>
          </div>
        </div>

        <CaretDownIcon
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
            "group-data-[state=open]/audit-card:rotate-180",
          )}
          aria-hidden
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-3 border-t border-border px-4 py-3">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Responsável</dt>
              <dd className="text-foreground">
                {log.actorName ?? "Sistema"}
                {log.actorEmail ? (
                  <span className="block text-xs text-muted-foreground">
                    {log.actorEmail}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Quando</dt>
              <dd className="text-foreground">
                {format(log.createdAt, "dd/MM/yyyy 'às' HH:mm:ss", {
                  locale: ptBR,
                })}
              </dd>
            </div>
            {log.entityId ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Referência
                </dt>
                <dd className="font-mono text-xs text-muted-foreground">
                  {log.entityId}
                </dd>
              </div>
            ) : null}
          </dl>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              O que mudou
            </p>
            <ChangesDetail log={log} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AuditLogsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-lg border border-border p-4">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuditLogsTable({ filters, onPageChange }: AuditLogsTableProps) {
  const query = useAuditLogsQuery(filters);

  if (query.isLoading) {
    return <AuditLogsSkeleton rows={DEFAULT_LIST_PAGE_SIZE} />;
  }

  if (query.isError) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar os registros de auditoria.
      </p>
    );
  }

  const result = query.data;
  const items = result?.items ?? [];

  if (items.length === 0) {
    return (
      <Empty className="border border-dashed py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotePencilIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Nenhum registro</EmptyTitle>
          <EmptyDescription>
            As ações da clínica aparecerão aqui quando forem realizadas.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {items.map((log) => (
          <AuditLogCard key={log.id} log={log} />
        ))}
      </div>

      {result ? (
        <DataTablePagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
