"use client"

import { compilePrescriptionTemplate } from "@/modules/medical-records/prescription-template-designer"
import type { PrescriptionDocumentModel } from "@/modules/medical-records/prescription-template-designer"
import { PrescriptionLivePreview } from "@/modules/medical-records/components/PrescriptionLivePreview"

const SAMPLE_CLINIC = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Clínica Exemplo",
  document: "12.345.678/0001-90",
  addressLine: "Rua das Flores, 100 — Centro",
  phone: "(11) 99999-0000",
  email: "contato@clinica.exemplo",
}

const SAMPLE_PATIENT = {
  id: "00000000-0000-4000-8000-000000000002",
  name: "Maria Silva",
  document: "123.456.789-00",
}

const SAMPLE_PROFESSIONAL = {
  id: "00000000-0000-4000-8000-000000000003",
  name: "Dr. João Souza",
  councilType: "CRM",
  councilNumber: "12345",
  councilState: "SP",
  specialty: "Clínica Geral",
}

type TemplateLiveCanvasProps = {
  model: PrescriptionDocumentModel
  className?: string
  scale?: number
}

export function TemplateLiveCanvas({
  model,
  className,
  scale = 0.38,
}: TemplateLiveCanvasProps) {
  const layoutHtml = compilePrescriptionTemplate(model)

  return (
    <PrescriptionLivePreview
      layoutHtml={layoutHtml}
      body="<p>Dipirona 500 mg — 1 comprimido a cada 6 horas se dor ou febre.</p>"
      clinic={SAMPLE_CLINIC}
      patient={SAMPLE_PATIENT}
      professional={SAMPLE_PROFESSIONAL}
      className={className}
      scale={scale}
    />
  )
}
