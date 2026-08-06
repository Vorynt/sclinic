"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { useDeleteScheduleBlockMutation } from "@/modules/appointments/hooks/use-schedule-blocks"
import {
  isClinicWideScheduleBlock,
  type ScheduleBlock,
} from "@/modules/appointments/types/schedule-block"
import { isAppError } from "@/shared/errors"

type ScheduleBlockDetailDialogProps = {
  block: ScheduleBlock | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleBlockDetailDialog({
  block,
  open,
  onOpenChange,
}: ScheduleBlockDetailDialogProps) {
  const deleteMutation = useDeleteScheduleBlockMutation({
    onSuccess: () => {
      toast.success("Bloqueio removido.")
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        isAppError(error)
          ? error.message
          : "Não foi possível remover o bloqueio.",
      )
    },
  })

  if (!block) return null

  const clinicWide = isClinicWideScheduleBlock(block)
  const title = block.reason?.trim() || "Bloqueio de horário"
  const scopeLabel = clinicWide
    ? "Toda a clínica"
    : (block.professionalName ?? "Profissional")
  const rangeLabel = `${format(block.startsAt, "dd MMM yyyy, HH:mm", {
    locale: ptBR,
  })} – ${format(block.endsAt, "HH:mm", { locale: ptBR })}`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Escopo:</span>{" "}
                {scopeLabel}
              </p>
              <p>
                <span className="font-medium text-foreground">Quando:</span>{" "}
                {rangeLabel}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Fechar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              deleteMutation.mutate({ id: block.id })
            }}
          >
            {deleteMutation.isPending ? "Removendo…" : "Remover bloqueio"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
