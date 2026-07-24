"use client"

import { ArrowLeftIcon, CalendarBlankIcon } from "@phosphor-icons/react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import { PatientClinicalAlertBadges } from "@/modules/medical-records/components/PatientClinicalAlertBadges"
import { usePatientsListReturnHref } from "@/modules/patients/hooks/use-patients-list-return-href"
import type { Patient } from "@/modules/patients/types/patient"
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age"
import { useAuth } from "@/providers/AuthProvider"

const STATUS_LABELS: Record<Patient["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
}

type PatientDetailHeaderProps = {
  patient: Patient
  onSchedule?: () => void
}

export function PatientDetailHeader({
  patient,
  onSchedule,
}: PatientDetailHeaderProps) {
  const { can } = useAuth()
  const patientsHref = usePatientsListReturnHref()
  const ageYears = getPatientAgeYears(patient.birthDate)
  const canSchedule = Boolean(onSchedule) && can(Permission.APPOINTMENTS_CREATE)
  const canReadRecords = can(Permission.RECORDS_READ)

  return (
    <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href={patientsHref}>
            <ArrowLeftIcon />
            Pacientes
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {patient.name}
          </h1>
          <Badge variant={patient.status === "active" ? "secondary" : "outline"}>
            {STATUS_LABELS[patient.status]}
          </Badge>
          {ageYears != null ? (
            <Badge variant="outline">{ageYears} anos</Badge>
          ) : null}
        </div>

        {canReadRecords ? (
          <PatientClinicalAlertBadges patientId={patient.id} />
        ) : null}
      </div>

      {canSchedule ? (
        <Button type="button" onClick={onSchedule}>
          <CalendarBlankIcon />
          Agendar
        </Button>
      ) : null}
    </header>
  )
}
