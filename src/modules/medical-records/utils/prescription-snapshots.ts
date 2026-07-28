import type { PrescriptionPartySnapshot } from "@/db/schema"
import type { Clinic } from "@/modules/clinics/types/clinic"
import type { Patient } from "@/modules/patients/types/patient"
import type { ProfessionalListItem } from "@/modules/professionals/types/professional"

function formatClinicAddress(clinic: Clinic): string | null {
  const parts = [
    [clinic.addressStreet, clinic.addressNumber].filter(Boolean).join(", "),
    clinic.addressComplement,
    clinic.addressNeighborhood,
    [clinic.addressCity, clinic.addressState].filter(Boolean).join(" — "),
    clinic.addressZip,
  ].filter((part) => Boolean(part && String(part).trim()))

  return parts.length > 0 ? parts.join(" · ") : null
}

export function toClinicSnapshot(clinic: Clinic): PrescriptionPartySnapshot {
  return {
    id: clinic.id,
    name: clinic.tradeName?.trim() || clinic.name,
    document: clinic.document,
    email: clinic.email,
    phone: clinic.phone,
    addressLine: formatClinicAddress(clinic),
    logoUrl: null,
  }
}

export function toPatientSnapshot(patient: Patient): PrescriptionPartySnapshot {
  return {
    id: patient.id,
    name: patient.name,
    document: patient.cpf,
    email: patient.email ?? null,
    phone: patient.phone ?? null,
  }
}

export function toProfessionalSnapshot(
  professional: ProfessionalListItem,
): PrescriptionPartySnapshot {
  return {
    id: professional.id,
    name: professional.fullName ?? "Profissional",
    email: professional.email,
    councilType: professional.councilType,
    councilNumber: professional.councilNumber,
    councilState: professional.councilState,
    specialty: professional.specialty,
    treatmentPronoun: professional.treatmentPronoun,
  }
}

export function toProfessionalSnapshotFromAppointment(params: {
  professionalId: string | null
  professionalName: string | null
}): PrescriptionPartySnapshot | null {
  if (!params.professionalId) return null
  return {
    id: params.professionalId,
    name: params.professionalName ?? "Profissional",
  }
}
