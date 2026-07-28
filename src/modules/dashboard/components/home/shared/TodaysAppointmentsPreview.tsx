"use client"

import { endOfDay, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { routes } from "@/config/routes"
import { AppointmentDetailDrawer } from "@/modules/appointments/components/AppointmentDetailDrawer"
import { useAppointmentsQuery } from "@/modules/appointments/hooks/use-appointments"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"

const PREVIEW_LIMIT = 5

type TodaysAppointmentsPreviewProps = {
  title?: string
  description?: string
  emptyMessage?: string
}

export function TodaysAppointmentsPreview({
  title = "Agenda de hoje",
  description,
  emptyMessage = "Nenhum agendamento para hoje.",
}: TodaysAppointmentsPreviewProps) {
  const range = useMemo(() => {
    const now = new Date()
    return { from: startOfDay(now), to: endOfDay(now) }
  }, [])

  const query = useAppointmentsQuery(range)
  const appointments = (query.data ?? [])
    .filter((item) => item.status !== "canceled")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, PREVIEW_LIMIT)

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)

  return (
    <>
      <HomeSection
        title={title}
        description={
          description ??
          format(range.from, "EEEE, dd 'de' MMMM", { locale: ptBR })
        }
      >
        {query.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl bg-muted/40 px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
            {emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {appointment.patientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {appointment.professionalName
                        ? `${appointment.professionalName} · `
                        : null}
                      {format(appointment.startsAt, "HH:mm")}–
                      {format(appointment.endsAt, "HH:mm")}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div>
          <Button variant="link" size="sm" asChild>
            <Link href={routes.appointments}>Ver agenda completa</Link>
          </Button>
        </div>
      </HomeSection>

      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        open={Boolean(selectedAppointment)}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null)
        }}
        onAppointmentChange={setSelectedAppointment}
      />
    </>
  )
}
