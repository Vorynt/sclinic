"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { AppointmentForm } from "@/modules/appointments/components/AppointmentForm";
import {
  appointmentModalitySchema,
  appointmentTypeSchema,
} from "@/modules/appointments/schemas/appointment.schema";
import type {
  AppointmentModality,
  AppointmentType,
} from "@/modules/appointments/types/appointment";
import { appointmentNewLocationFromSearchParams } from "@/modules/appointments/utils/appointment-new-href";

function parseAppointmentType(value: string | null): AppointmentType {
  const parsed = appointmentTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "consultation";
}

function parseAppointmentModality(value: string | null): AppointmentModality {
  const parsed = appointmentModalitySchema.safeParse(value);
  return parsed.success ? parsed.data : "in_person";
}

export function AppointmentNewPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = appointmentNewLocationFromSearchParams(searchParams);

  const lockedPatient =
    location.lockPatient && location.patientId
      ? {
          id: location.patientId,
          name: location.patientName?.trim() || "Paciente",
        }
      : undefined;

  const formKey = [
    location.patientId ?? "free",
    location.professionalId ?? "none",
    location.date ?? location.startsAt?.toISOString() ?? "now",
    location.startTime ?? "time",
    location.serviceId ?? "service",
    location.waitlistId ?? "none",
    location.type ?? "consultation",
    location.durationMinutes ?? "30",
  ].join(":");

  function goBackToAgenda() {
    router.push(routes.appointments);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title={
          location.waitlistId
            ? "Promover da lista de espera"
            : "Novo agendamento"
        }
        description={
          location.waitlistId
            ? "Defina horário, serviço, motivo e cobrança para promover o paciente."
            : "Preencha motivo e cobrança quando necessário."
        }
      />

      <AppointmentForm
        key={formKey}
        variant="full"
        layout="page"
        defaultStartsAt={location.startsAt}
        defaultDate={location.date}
        defaultStartTime={location.startTime}
        lockedPatient={lockedPatient}
        defaultPatientId={lockedPatient ? null : location.patientId}
        defaultPatientLabel={lockedPatient ? null : location.patientName}
        defaultType={parseAppointmentType(location.type)}
        defaultProfessionalId={location.professionalId}
        defaultProfessionalLabel={location.professionalName}
        defaultModality={parseAppointmentModality(location.modality)}
        defaultDurationMinutes={location.durationMinutes ?? "30"}
        defaultServiceId={location.serviceId ?? ""}
        defaultReason={location.reason ?? ""}
        waitlistId={location.waitlistId ?? undefined}
        onSuccess={goBackToAgenda}
        onCancel={goBackToAgenda}
      />
    </div>
  );
}
