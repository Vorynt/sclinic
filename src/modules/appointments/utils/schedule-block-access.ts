import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"

/**
 * Pure rules for schedule-block create/delete (self-schedule + clinic-wide).
 */

export function canCreateScheduleBlock(params: {
  roleKey: string | null | undefined
  ownProfessionalId: string | null
  /** null = clinic-wide */
  targetProfessionalId: string | null
}): { ok: true } | { ok: false; message: string } {
  const selfOnly = isSelfScheduleOnlyRole(params.roleKey)

  if (params.targetProfessionalId == null) {
    if (selfOnly) {
      return {
        ok: false,
        message: "Apenas a recepção ou gestores podem bloquear a clínica inteira.",
      }
    }
    return { ok: true }
  }

  if (selfOnly) {
    if (
      !params.ownProfessionalId ||
      params.targetProfessionalId !== params.ownProfessionalId
    ) {
      return {
        ok: false,
        message: "Você só pode bloquear horários da sua própria agenda.",
      }
    }
  }

  return { ok: true }
}

export function canDeleteScheduleBlock(params: {
  roleKey: string | null | undefined
  ownProfessionalId: string | null
  /** null = clinic-wide */
  blockProfessionalId: string | null
}): { ok: true } | { ok: false; message: string } {
  const selfOnly = isSelfScheduleOnlyRole(params.roleKey)

  if (params.blockProfessionalId == null) {
    if (selfOnly) {
      return {
        ok: false,
        message: "Apenas a recepção ou gestores podem remover bloqueios da clínica.",
      }
    }
    return { ok: true }
  }

  if (selfOnly) {
    if (
      !params.ownProfessionalId ||
      params.blockProfessionalId !== params.ownProfessionalId
    ) {
      return {
        ok: false,
        message: "Você só pode remover bloqueios da sua própria agenda.",
      }
    }
  }

  return { ok: true }
}
