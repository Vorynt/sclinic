import type { Metadata } from "next"
import type { ReactNode } from "react"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PermissionProvider } from "@/providers/PermissionProvider"

import { PatientDetailLayoutClient } from "./patient-detail-layout-client"

export const metadata: Metadata = {
  title: "Paciente · sclinic",
}

type PatientDetailLayoutProps = {
  children: ReactNode
  params: Promise<{ patientId: string }>
}

export default async function PatientDetailLayout({
  children,
  params,
}: PatientDetailLayoutProps) {
  const { patientId } = await params

  return (
    <PermissionProvider
      permission={Permission.PATIENTS_READ}
      fallback={<ForbiddenBlock />}
    >
      <PatientDetailLayoutClient patientId={patientId}>
        {children}
      </PatientDetailLayoutClient>
    </PermissionProvider>
  )
}
