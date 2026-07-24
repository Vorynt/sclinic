"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { PatientAppointmentHistory } from "@/modules/appointments/components/PatientAppointmentHistory"
import { PatientClinicalAlertsPanel } from "@/modules/medical-records/components/PatientClinicalAlertsPanel"
import { PatientQuickCard } from "@/modules/patients/components/PatientQuickCard"
import {
  patientsListLocationFromSearchParams,
  withPatientsListParams,
} from "@/modules/patients/utils/patients-list-href"
import { useAuth } from "@/providers/AuthProvider"

type PatientOverviewPanelProps = {
  patientId: string
}

/**
 * Aggregates patient context for the detail overview.
 * Cross-module UI composition mirrors AttendanceOverviewPanel.
 */
export function PatientOverviewPanel({
  patientId,
}: PatientOverviewPanelProps) {
  const { can, canAny } = useAuth()
  const searchParams = useSearchParams()
  const listLocation = patientsListLocationFromSearchParams(searchParams)
  const canReadRecords = can(Permission.RECORDS_READ)
  const canReadAppointments = canAny(
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.APPOINTMENTS_DELETE,
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Resumo
        </h2>
        <p className="text-sm text-muted-foreground">
          Visão geral do paciente. Use a navegação ao lado para abrir cadastro,
          histórico e seções clínicas.
        </p>
      </div>

      <PatientQuickCard patientId={patientId} />

      {canReadRecords ? (
        <PatientClinicalAlertsPanel patientId={patientId} />
      ) : null}

      {canReadAppointments ? (
        <PatientAppointmentHistory
          patientId={patientId}
          limit={5}
          title="Consultas recentes"
          description="Últimos agendamentos deste paciente."
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link
            href={withPatientsListParams(
              routes.patientDetailProfile(patientId),
              listLocation,
            )}
          >
            Abrir cadastro
          </Link>
        </Button>
        {canReadAppointments ? (
          <Button asChild variant="outline" size="sm">
            <Link
              href={withPatientsListParams(
                routes.patientDetailAppointments(patientId),
                listLocation,
              )}
            >
              Ver agendamentos
            </Link>
          </Button>
        ) : null}
        {canReadRecords ? (
          <>
            <Button asChild variant="outline" size="sm">
              <Link
                href={withPatientsListParams(
                  routes.patientDetailNotes(patientId),
                  listLocation,
                )}
              >
                Ver anotações
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={withPatientsListParams(
                  routes.patientDetailVitals(patientId),
                  listLocation,
                )}
              >
                Ver sinais vitais
              </Link>
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
