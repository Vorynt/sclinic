"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormErrorAlert } from "@/components/ui/form-error-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useEnqueueWaitlistMutation } from "@/modules/appointments/hooks/use-waitlist";
import { enqueueWaitlistSchema } from "@/modules/appointments/schemas/waitlist.schema";
import { useActiveClinicServices } from "@/modules/billing/hooks/use-clinic-services";
import { PatientCombobox } from "@/modules/patients/components/PatientCombobox";
import { PatientFormDialog } from "@/modules/patients/components/PatientFormDialog";
import type { Patient } from "@/modules/patients/types/patient";
import { ProfessionalCombobox } from "@/modules/professionals/components/ProfessionalCombobox";
import { ErrorCode, getClientMessage, isAppError } from "@/shared/errors";

type WaitlistEnqueueFormValues = {
  patientId: string;
  professionalId?: string;
  serviceId?: string;
  notes?: string;
};

type WaitlistEnqueueDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function WaitlistEnqueueDialog({
  open,
  onOpenChange,
  onSuccess,
}: WaitlistEnqueueDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [selectedPatientLabel, setSelectedPatientLabel] = useState<
    string | null
  >(null);

  const activeServicesQuery = useActiveClinicServices();
  const activeServices = activeServicesQuery.data ?? [];

  const form = useForm<WaitlistEnqueueFormValues>({
    resolver: zodResolver(enqueueWaitlistSchema),
    defaultValues: {
      patientId: "",
      professionalId: "",
      serviceId: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    register,
    formState: { errors },
  } = form;

  const enqueueWaitlist = useEnqueueWaitlistMutation({
    onSuccess: () => {
      toast.success("Paciente adicionado à lista de espera");
      reset();
      setSelectedPatientLabel(null);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      setFormError(
        isAppError(error)
          ? getClientMessage(error.code)
          : getClientMessage(ErrorCode.INTERNAL_ERROR),
      );
    },
  });

  function handlePatientCreated(patient: Patient) {
    setSelectedPatientLabel(patient.name);
    setValue("patientId", patient.id, { shouldValidate: true });
  }

  const onSubmit = handleSubmit((data) => {
    setFormError(null);
    enqueueWaitlist.mutate({
      patientId: data.patientId,
      professionalId: data.professionalId || undefined,
      serviceId: data.serviceId || undefined,
      notes: data.notes,
    });
  });

  const isPending = enqueueWaitlist.isPending;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            reset();
            setSelectedPatientLabel(null);
            setFormError(null);
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Adicionar à lista de espera</DialogTitle>
            <DialogDescription>
              O paciente aguarda um horário livre; nenhum agendamento é criado
              agora.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              {formError ? <FormErrorAlert message={formError} /> : null}

              <FieldGroup className="flex flex-col gap-4">
                <Field data-invalid={Boolean(errors.patientId) || undefined}>
                  <FieldLabel>Paciente</FieldLabel>
                  <Controller
                    name="patientId"
                    control={control}
                    render={({ field }) => (
                      <PatientCombobox
                        value={field.value}
                        onValueChange={(patientId) => {
                          setSelectedPatientLabel(null);
                          field.onChange(patientId);
                        }}
                        displayLabel={selectedPatientLabel}
                        onCreatePatient={() => setPatientDialogOpen(true)}
                        disabled={isPending}
                        aria-invalid={Boolean(errors.patientId) || undefined}
                      />
                    )}
                  />
                  <FieldError errors={[errors.patientId]} />
                </Field>

                <Field>
                  <FieldLabel>Profissional (opcional)</FieldLabel>
                  <Controller
                    name="professionalId"
                    control={control}
                    render={({ field }) => (
                      <ProfessionalCombobox
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      />
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel>Serviço (opcional)</FieldLabel>
                  <Controller
                    name="serviceId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={isPending || activeServicesQuery.isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field data-invalid={Boolean(errors.notes) || undefined}>
                  <FieldLabel htmlFor="waitlist-notes">
                    Observações (opcional)
                  </FieldLabel>
                  <Textarea
                    id="waitlist-notes"
                    placeholder="Ex.: prefere período da manhã"
                    disabled={isPending}
                    {...register("notes")}
                  />
                  <FieldError errors={[errors.notes]} />
                </Field>
              </FieldGroup>

              <DialogFooter className="mx-0 mb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Spinner /> : null}
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <PatientFormDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        variant="quick"
        onSuccess={handlePatientCreated}
      />
    </>
  );
}
