"use client";

import { useMemo } from "react";

import { useAppointmentsCountQuery } from "@/modules/appointments/hooks/use-appointments";
import { useActiveClinicServicesQuery } from "@/modules/billing/hooks/use-clinic-services";
import { OWNER_SETUP_APPOINTMENT_COUNT_RANGE } from "@/modules/dashboard/constants/owner-setup-missions";
import {
  resolveOwnerSetupProgress,
  type OwnerSetupProgress,
} from "@/modules/dashboard/utils/owner-setup-progress";
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients";
import { useProfessionalsForSchedulingQuery } from "@/modules/professionals/hooks/use-professionals";

export type UseOwnerSetupProgressResult = {
  progress: OwnerSetupProgress | null;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Derives owner setup roadmap progress from domain queries.
 * Card should hide when `progress.allComplete`.
 */
export function useOwnerSetupProgress(options?: {
  enabled?: boolean;
}): UseOwnerSetupProgressResult {
  const enabled = options?.enabled ?? true;

  const professionalsQuery = useProfessionalsForSchedulingQuery(undefined, {
    enabled,
  });
  const servicesQuery = useActiveClinicServicesQuery(undefined, { enabled });
  const patientsQuery = usePatientsQuery({ page: 1, pageSize: 1 }, { enabled });
  const appointmentsQuery = useAppointmentsCountQuery(
    {
      from: OWNER_SETUP_APPOINTMENT_COUNT_RANGE.from,
      to: OWNER_SETUP_APPOINTMENT_COUNT_RANGE.to,
      excludeCanceled: true,
    },
    enabled,
  );

  const isLoading =
    enabled &&
    (professionalsQuery.isLoading ||
      servicesQuery.isLoading ||
      patientsQuery.isLoading ||
      appointmentsQuery.isLoading);

  const isError =
    enabled &&
    (professionalsQuery.isError ||
      servicesQuery.isError ||
      patientsQuery.isError ||
      appointmentsQuery.isError);

  const progress = useMemo(() => {
    if (!enabled || isLoading || isError) return null;

    return resolveOwnerSetupProgress({
      hasProfessional: (professionalsQuery.data?.length ?? 0) > 0,
      hasService: (servicesQuery.data?.length ?? 0) > 0,
      hasPatient: (patientsQuery.data?.total ?? 0) > 0,
      hasAppointment: (appointmentsQuery.data ?? 0) > 0,
    });
  }, [
    enabled,
    isLoading,
    isError,
    professionalsQuery.data,
    servicesQuery.data,
    patientsQuery.data,
    appointmentsQuery.data,
  ]);

  return { progress, isLoading, isError };
}
