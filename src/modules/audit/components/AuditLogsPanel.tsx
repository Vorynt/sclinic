"use client"

import { parseAsStringLiteral, useQueryState } from "nuqs"

import { DataTableSearch } from "@/components/data-table/DataTableSearch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListQueryParams } from "@/hooks/use-list-query-params"
import { AuditLogsTable } from "@/modules/audit/components/AuditLogsTable"
import { AUDIT_ENTITY_TYPES } from "@/modules/audit/constants/audit"
import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { useAuth } from "@/providers/AuthProvider"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

const STATUS_FILTERS = ["all", "success", "error"] as const
const ENTITY_FILTERS = [
  "all",
  AUDIT_ENTITY_TYPES.PATIENT,
  AUDIT_ENTITY_TYPES.APPOINTMENT,
  AUDIT_ENTITY_TYPES.CLINIC,
  AUDIT_ENTITY_TYPES.CLINIC_HOURS,
  AUDIT_ENTITY_TYPES.MEMBER,
  AUDIT_ENTITY_TYPES.INVITATION,
] as const

export function AuditLogsPanel() {
  const { can, isLoading } = useAuth()
  const { q, page, pageSize, setQ, setPage } = useListQueryParams()
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  )
  const [entityType, setEntityType] = useQueryState(
    "entity",
    parseAsStringLiteral(ENTITY_FILTERS).withDefault("all"),
  )

  if (isLoading) {
    return null
  }

  if (!can(Permission.AUDIT_READ)) {
    return <ForbiddenBlock />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <DataTableSearch
            value={q ?? ""}
            onValueChange={setQ}
            placeholder="Buscar por ação, ator ou entidade"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={status}
            onValueChange={(value) => {
              void setStatus(value as (typeof STATUS_FILTERS)[number])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={entityType}
            onValueChange={(value) => {
              void setEntityType(value as (typeof ENTITY_FILTERS)[number])
              setPage(1)
            }}
          >
            <SelectTrigger
              className="w-full sm:w-48"
              aria-label="Entidade"
            >
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as entidades</SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.PATIENT}>Paciente</SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.APPOINTMENT}>
                Agendamento
              </SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.CLINIC}>Clínica</SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.CLINIC_HOURS}>
                Horários
              </SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.MEMBER}>Membro</SelectItem>
              <SelectItem value={AUDIT_ENTITY_TYPES.INVITATION}>
                Convite
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AuditLogsTable
        filters={{
          q,
          page: page ?? 1,
          pageSize: pageSize ?? DEFAULT_LIST_PAGE_SIZE,
          status: status === "all" ? undefined : status,
          entityType: entityType === "all" ? undefined : entityType,
        }}
        onPageChange={setPage}
      />
    </div>
  )
}
