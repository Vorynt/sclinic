"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { AttendanceCompleteAction } from "@/modules/appointments/components/AttendanceCompleteAction"
import { AttendanceSecondaryActions } from "@/modules/appointments/components/AttendanceSecondaryActions"
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/modules/appointments/constants/appointments"
import type {
  Appointment,
  AppointmentStatus,
} from "@/modules/appointments/types/appointment"
import { PatientClinicalAlertBadges } from "@/modules/medical-records/components/PatientClinicalAlertBadges"

type AttendanceHeaderProps = {
  appointment: Appointment
}

function statusBadgeVariant(
  status: AppointmentStatus,
): "secondary" | "outline" | "destructive" {
  if (status === "canceled" || status === "no_show") return "destructive"
  if (status === "completed") return "secondary"
  if (status === "checked_in") return "outline"
  return "outline"
}

export function AttendanceHeader({ appointment }: AttendanceHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {appointment.patientName}
          </h1>
          <Badge variant={statusBadgeVariant(appointment.status)}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
          <Badge variant="outline">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </Badge>
        </div>

        <PatientClinicalAlertBadges patientId={appointment.patientId} />

        <p className="text-sm text-muted-foreground">
          {format(appointment.startsAt, "EEEE, dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}{" "}
          · {format(appointment.startsAt, "HH:mm")}–
          {format(appointment.endsAt, "HH:mm")}
          {appointment.professionalName
            ? ` · ${appointment.professionalName}`
            : null}
        </p>
      </div>

      <div className="hidden shrink-0 flex-wrap items-center gap-2 lg:flex">
        <AttendanceSecondaryActions className="flex flex-wrap items-center gap-2" />
        <AttendanceCompleteAction appointment={appointment} />
      </div>
    </header>
  )
}
