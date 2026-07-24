"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { usePatient } from "@/modules/patients/hooks/use-patient";
import type { Patient } from "@/modules/patients/types/patient";
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age";
import { formatCpf } from "@/utils/cpf";
import { formatPhone } from "@/utils/phone";

type PatientCompactSummaryProps = {
  patientId: string;
};

/**
 * Compact patient registration snippet for dense surfaces (e.g. appointment drawer).
 */
export function PatientCompactSummary({
  patientId,
}: PatientCompactSummaryProps) {
  const patientQuery = usePatient(patientId);

  if (patientQuery.isLoading) {
    return (
      <section className="flex justify-center rounded-md border border-border px-3 py-4">
        <Spinner />
      </section>
    );
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <section className="rounded-md border border-border px-3 py-3">
        <p className="text-sm text-destructive">
          Não foi possível carregar os dados do paciente.
        </p>
      </section>
    );
  }

  return <PatientCompactSummaryContent patient={patientQuery.data} />;
}

function PatientCompactSummaryContent({ patient }: { patient: Patient }) {
  const ageYears = getPatientAgeYears(patient.birthDate);

  return (
    <section className="flex flex-col gap-2 rounded-md border border-border px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">
          Dados do paciente
        </h3>
        <Button
          variant="link"
          size="sm"
          className="h-auto shrink-0 px-0"
          asChild>
          <Link href={routes.patientDetail(patient.id)} target="_blank">
            Abrir ficha
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">CPF</dt>
          <dd className="text-foreground">
            {patient.cpf ? formatCpf(patient.cpf) : "—"}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Idade</dt>
          <dd className="text-foreground">
            {ageYears != null ? `${ageYears} anos` : "—"}
          </dd>
        </div>

        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Telefone</dt>
          <dd className="text-foreground">
            {patient.phone ? formatPhone(patient.phone) : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
