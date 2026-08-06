"use client"

import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Spinner } from "@/components/ui/spinner"
import { PrescriptionListItem } from "@/modules/medical-records/components/PrescriptionListItem"
import { usePatientPrescriptionsQuery } from "@/modules/medical-records/hooks/use-prescriptions"

type PatientPrescriptionsSectionProps = {
  patientId: string
}

export function PatientPrescriptionsSection({
  patientId,
}: PatientPrescriptionsSectionProps) {
  const query = usePatientPrescriptionsQuery({ patientId })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Documentos
        </h2>
        <p className="text-sm text-muted-foreground">
          Histórico de receitas, declarações e outros documentos deste paciente.
        </p>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : query.isError ? (
        <QueryErrorState
          description="Não foi possível carregar os documentos."
          onRetry={() => {
            void query.refetch()
          }}
          isRetrying={query.isFetching}
        />
      ) : !query.data?.length ? (
        <p className="text-sm text-muted-foreground">
          Nenhum documento registrado.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {query.data.map((item) => (
            <PrescriptionListItem key={item.id} prescription={item} />
          ))}
        </ul>
      )}
    </div>
  )
}
