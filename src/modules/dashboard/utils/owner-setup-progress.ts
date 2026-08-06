import {
  OWNER_SETUP_MISSIONS,
  type OwnerSetupMissionId,
} from "@/modules/dashboard/constants/owner-setup-missions"

export type OwnerSetupFlags = {
  hasProfessional: boolean
  hasService: boolean
  hasPatient: boolean
  hasAppointment: boolean
}

export type OwnerSetupMissionView = {
  id: OwnerSetupMissionId
  title: string
  description: string
  href: string
  ctaLabel: string
  unlocksScheduling: boolean
  completed: boolean
  /** True when the mission cannot be started yet (prerequisites missing). */
  locked: boolean
}

export type OwnerSetupProgress = {
  missions: OwnerSetupMissionView[]
  completedCount: number
  totalCount: number
  percent: number
  /** Professional + service + patient — unlocks creating appointments. */
  canSchedule: boolean
  /** All missions done → hide the roadmap card. */
  allComplete: boolean
}

export function resolveOwnerSetupProgress(
  flags: OwnerSetupFlags,
): OwnerSetupProgress {
  const canSchedule =
    flags.hasProfessional && flags.hasService && flags.hasPatient

  const completedById: Record<OwnerSetupMissionId, boolean> = {
    professional: flags.hasProfessional,
    service: flags.hasService,
    patient: flags.hasPatient,
    appointment: flags.hasAppointment,
  }

  const missions: OwnerSetupMissionView[] = OWNER_SETUP_MISSIONS.map(
    (mission) => {
      const completed = completedById[mission.id]
      const locked =
        mission.id === "appointment" && !canSchedule && !completed

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        href: mission.href,
        ctaLabel: mission.ctaLabel,
        unlocksScheduling: mission.unlocksScheduling,
        completed,
        locked,
      }
    },
  )

  const completedCount = missions.filter((m) => m.completed).length
  const totalCount = missions.length
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  return {
    missions,
    completedCount,
    totalCount,
    percent,
    canSchedule,
    allComplete: completedCount === totalCount,
  }
}
