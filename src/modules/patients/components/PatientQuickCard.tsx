"use client"

import { Spinner } from "@/components/ui/spinner"
import { usePatient } from "@/modules/patients/hooks/use-patient"
import type { Patient } from "@/modules/patients/types/patient"
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age"
import { formatCpf } from "@/utils/cpf"

type PatientQuickCardProps = {
  patientId: string
}

export function PatientQuickCard({ patientId }: PatientQuickCardProps) {
  const patientQuery = usePatient(patientId)

  if (patientQuery.isLoading) {
    return (
      <section className="flex justify-center rounded-md border border-border px-4 py-8">
        <Spinner />
      </section>
    )
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <section className="rounded-md border border-border px-4 py-4">
        <p className="text-sm text-destructive">
          Não foi possível carregar a ficha do paciente.
        </p>
      </section>
    )
  }

  return <PatientQuickCardContent patient={patientQuery.data} />
}

function PatientQuickCardContent({ patient }: { patient: Patient }) {
  const ageYears = getPatientAgeYears(patient.birthDate)
  const emergency =
    patient.emergencyContactName || patient.emergencyContactPhone
      ? [patient.emergencyContactName, patient.emergencyContactPhone]
          .filter(Boolean)
          .join(" · ")
      : null

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border px-4 py-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Ficha do paciente
        </h3>
        <p className="text-xs text-muted-foreground">
          Dados cadastrais para contexto do atendimento.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Nome</dt>
          <dd className="text-sm font-medium text-foreground">{patient.name}</dd>
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
          <dd className="text-sm text-foreground">{patient.phone || "—"}</dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="text-sm text-foreground">{patient.email || "—"}</dd>
        </div>

        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Contato de emergência</dt>
          <dd className="text-sm text-foreground">{emergency || "—"}</dd>
        </div>
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
