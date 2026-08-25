"use client"

import { CheckCircleIcon, LockSimpleIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Permission } from "@/config/permissions"
import { AttendanceTabButton } from "@/modules/appointments/components/AttendanceTabButton"
import {
  canCompleteAttendance,
  canPerformThisAttendance,
  COMPLETE_ATTENDANCE_DENIED_TOOLTIP,
} from "@/modules/appointments/constants/appointments"
import { useAgendaReturnHref } from "@/modules/appointments/hooks/use-agenda-return-href"
import { useOwnProfessionalIdQuery } from "@/modules/appointments/hooks/use-appointment"
import { useUpdateAppointmentStatusMutation } from "@/modules/appointments/hooks/use-appointment-mutations"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { useAuthSession } from "@/modules/authentication/hooks/use-auth"
import { useAuth } from "@/providers/AuthProvider"

type AttendanceCompleteActionProps = {
  appointment: Appointment
  className?: string
  presentation?: "button" | "tab"
}

export function AttendanceCompleteAction({
  appointment,
  className,
  presentation = "button",
}: AttendanceCompleteActionProps) {
  const { can } = useAuth()
  const canUpdate = can(Permission.APPOINTMENTS_UPDATE)
  const router = useRouter()
  const agendaHref = useAgendaReturnHref()
  const sessionQuery = useAuthSession()
  const ownProfessionalIdQuery = useOwnProfessionalIdQuery()

  const [completeOpen, setCompleteOpen] = useState(false)
  const [afterCompleteOpen, setAfterCompleteOpen] = useState(false)

  const completeAttendance = useUpdateAppointmentStatusMutation({
    onSuccess: () => {
      toast.success("Atendimento concluído")
      setCompleteOpen(false)
      setAfterCompleteOpen(true)
    },
    onError: (error) => toast.error(error.message),
  })

  const isCompletePermissionPending =
    sessionQuery.isPending || ownProfessionalIdQuery.isPending
  const canCompleteStatus = canCompleteAttendance(appointment.status)
  const canComplete =
    canCompleteStatus &&
    canUpdate &&
    canPerformThisAttendance({
      roleKey: sessionQuery.data?.membership?.roleKey,
      appointmentProfessionalId: appointment.professionalId,
      ownProfessionalId: ownProfessionalIdQuery.data ?? null,
    })
  const completeLocked =
    canCompleteStatus &&
    canUpdate &&
    !isCompletePermissionPending &&
    !canComplete

  if (!canCompleteStatus || !canUpdate) return null

  const triggerDisabled =
    completeAttendance.isPending ||
    isCompletePermissionPending ||
    completeLocked
  const triggerTooltip = completeLocked
    ? COMPLETE_ATTENDANCE_DENIED_TOOLTIP
    : undefined

  return (
    <>
      {presentation === "tab" ? (
        <li className="min-w-0">
          <AttendanceTabButton
            icon={
              isCompletePermissionPending || completeLocked
                ? LockSimpleIcon
                : CheckCircleIcon
            }
            label="Concluir"
            disabled={triggerDisabled}
            tooltip={triggerTooltip}
            onClick={() => setCompleteOpen(true)}
          />
        </li>
      ) : (
        <Button
          type="button"
          className={className}
          disabled={triggerDisabled}
          tooltip={triggerTooltip}
          onClick={() => setCompleteOpen(true)}
        >
          {isCompletePermissionPending || completeLocked ? (
            <LockSimpleIcon />
          ) : null}
          Concluir atendimento
        </Button>
      )}

      <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O paciente seguirá para a recepção para efetuar o pagamento, se
              houver cobrança pendente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeAttendance.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={completeAttendance.isPending}
              onClick={(event) => {
                event.preventDefault()
                completeAttendance.mutate({
                  id: appointment.id,
                  status: "completed",
                })
              }}
            >
              Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={afterCompleteOpen} onOpenChange={setAfterCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atendimento concluído</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja voltar à agenda ou permanecer neste atendimento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Permanecer no atendimento</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(agendaHref)}>
              Voltar à agenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
