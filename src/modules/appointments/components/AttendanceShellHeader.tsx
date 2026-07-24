"use client"

import { ArrowLeftIcon, StethoscopeIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAgendaReturnHref } from "@/modules/appointments/hooks/use-agenda-return-href"
import { useAttendanceUiStore } from "@/stores/attendance.store"

export function AttendanceShellHeader() {
  const router = useRouter()
  const agendaHref = useAgendaReturnHref()
  const endPreparingAttendance = useAttendanceUiStore(
    (state) => state.endPreparingAttendance,
  )
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)

  function goToAgenda() {
    endPreparingAttendance()
    router.push(agendaHref)
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => setLeaveConfirmOpen(true)}
            >
              <ArrowLeftIcon />
              Voltar à agenda
            </Button>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <StethoscopeIcon
                  className="size-3.5"
                  weight="bold"
                  aria-hidden
                />
              </span>
              <span className="font-heading text-sm font-semibold tracking-tight">
                Atendimento
              </span>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voltar à agenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Se o atendimento ainda estiver em andamento, ele permanecerá
              aberto até que você o conclua.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar no atendimento</AlertDialogCancel>
            <AlertDialogAction onClick={goToAgenda}>
              Voltar à agenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
