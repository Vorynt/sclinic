"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours"
import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema"
import {
  DAY_OF_WEEK_DISPLAY_ORDER,
  DAY_OF_WEEK_SHORT_PT,
} from "@/modules/clinics/types/clinic-hours"
import {
  useProfessionalHoursQuery,
  useUpsertProfessionalHoursMutation,
} from "@/modules/professionals/hooks/use-professional-hours"
import { isAppError } from "@/shared/errors"

type HoursFormValues = z.input<typeof clinicWeeklyHoursSchema>

type ProfessionalHoursDialogProps = {
  professionalId: string | null
  professionalName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isUnconfiguredWeek(
  days: { isClosed: boolean; intervals: unknown[] }[],
): boolean {
  return days.every((day) => day.isClosed && day.intervals.length === 0)
}

export function ProfessionalHoursDialog({
  professionalId,
  professionalName,
  open,
  onOpenChange,
}: ProfessionalHoursDialogProps) {
  const hoursQuery = useProfessionalHoursQuery(
    professionalId ?? "",
    open && Boolean(professionalId),
  )

  const upsertMutation = useUpsertProfessionalHoursMutation({
    onSuccess: () => {
      toast.success("Horários do profissional salvos.")
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        isAppError(error)
          ? error.message
          : "Não foi possível salvar os horários.",
      )
    },
  })

  const form = useForm<HoursFormValues>({
    resolver: zodResolver(clinicWeeklyHoursSchema),
    defaultValues: { days: buildOnboardingHoursDraft() },
  })

  useEffect(() => {
    if (!hoursQuery.data) return
    const initial = isUnconfiguredWeek(hoursQuery.data)
      ? buildOnboardingHoursDraft()
      : hoursQuery.data
    form.reset({ days: initial })
  }, [hoursQuery.data, form])

  function onSubmit(values: HoursFormValues) {
    if (!professionalId) return
    const parsed = clinicWeeklyHoursSchema.parse(values)
    upsertMutation.mutate({
      professionalId,
      days: parsed.days,
    })
  }

  const days = form.watch("days")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left">
          <DialogTitle>Horário do profissional</DialogTitle>
          <DialogDescription>
            {professionalName
              ? `Subconjunto do expediente da clínica para ${professionalName}.`
              : "Subconjunto do expediente da clínica. Sem configuração, herda o horário da clínica."}
          </DialogDescription>
        </DialogHeader>

        {hoursQuery.isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Spinner />
            Carregando…
          </div>
        ) : hoursQuery.isError ? (
          <p className="p-4 text-sm text-destructive">
            Não foi possível carregar os horários.
          </p>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {DAY_OF_WEEK_DISPLAY_ORDER.map((dow) => {
                const index = days.findIndex((d) => d.dayOfWeek === dow)
                if (index < 0) return null
                const day = days[index]!
                return (
                  <div
                    key={dow}
                    className="flex flex-col gap-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {DAY_OF_WEEK_SHORT_PT[dow]}
                      </span>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={!day.isClosed}
                          onCheckedChange={(checked) => {
                            form.setValue(
                              `days.${index}.isClosed`,
                              checked !== true,
                            )
                            if (checked === true) {
                              form.setValue(`days.${index}.intervals`, [
                                { opensAt: "08:00", closesAt: "18:00" },
                              ])
                            } else {
                              form.setValue(`days.${index}.intervals`, [])
                            }
                          }}
                        />
                        Aberto
                      </label>
                    </div>
                    {!day.isClosed ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Abre</Label>
                          <Controller
                            control={form.control}
                            name={`days.${index}.intervals.0.opensAt`}
                            render={({ field }) => (
                              <Input type="time" {...field} value={field.value ?? "08:00"} />
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Fecha</Label>
                          <Controller
                            control={form.control}
                            name={`days.${index}.intervals.0.closesAt`}
                            render={({ field }) => (
                              <Input type="time" {...field} value={field.value ?? "18:00"} />
                            )}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <DialogFooter className="shrink-0 border-t px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
