"use client"

import type { Patient } from "@/modules/patients/types/patient"
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age"
import { formatCpf } from "@/utils/cpf"
import { formatPhone } from "@/utils/phone"

type PatientCardProps = {
  patient: Patient
}

/**
 * Read-only registration card for the patient detail profile section.
 */
export function PatientCard({ patient }: PatientCardProps) {
  const ageYears = getPatientAgeYears(patient.birthDate)
  const emergency =
    patient.emergencyContactName || patient.emergencyContactPhone
      ? [
          patient.emergencyContactName,
          patient.emergencyContactPhone
            ? formatPhone(patient.emergencyContactPhone)
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border px-4 py-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Dados cadastrais
        </h3>
        <p className="text-xs text-muted-foreground">
          Informações demográficas e de contato.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Nome</dt>
          <dd className="wrap-anywhere text-sm font-medium text-foreground">
            {patient.name}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">CPF</dt>
          <dd className="text-sm text-foreground">
            {patient.cpf ? formatCpf(patient.cpf) : "—"}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Idade</dt>
          <dd className="text-sm text-foreground">
            {ageYears != null ? `${ageYears} anos` : "—"}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Telefone</dt>
          <dd className="text-sm text-foreground">
            {patient.phone ? formatPhone(patient.phone) : "—"}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="text-sm text-foreground">{patient.email || "—"}</dd>
        </div>

        {emergency ? (
          <div className="flex flex-col gap-0.5 sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              Contato de emergência
            </dt>
            <dd className="text-sm text-foreground">{emergency}</dd>
          </div>
        ) : null}
      </dl>

      {patient.notes ? (
        <div className="flex flex-col gap-0.5 border-t border-border pt-3">
          <h4 className="text-xs text-muted-foreground">
            Observações administrativas
          </h4>
          <p className="text-sm text-foreground">{patient.notes}</p>
        </div>
      ) : null}
    </section>
  )
}
