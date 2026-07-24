import { Permission } from "@/config/permissions";
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments";
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto";
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto";
import type { ListAppointmentsDto } from "@/modules/appointments/dto/list-appointments.dto";
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository";
import { professionalAvailabilityService } from "@/modules/appointments/services/professional-availability.service";
import type { Appointment } from "@/modules/appointments/types/appointment";
import {
  type AuthContextWithClinic,
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards";
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service";
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours";
import type { AuthRequestContext } from "@/shared/auth";
import { AppError, ErrorCode } from "@/shared/errors";

const APPOINTMENTS_ANY_PERMISSION = [
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,
] as const;

async function resolveOwnProfessionalId(
  auth: AuthContextWithClinic,
): Promise<string> {
  const ownProfessionalId =
    await appointmentRepository.findActiveProfessionalIdByUserId(
      auth.user.id,
      auth.clinicId,
    );
  if (!ownProfessionalId) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Seu perfil profissional não está vinculado a esta clínica.",
    });
  }
  return ownProfessionalId;
}

function assertOwnsAppointment(
  appointment: Appointment,
  professionalId: string,
): void {
  if (appointment.professionalId !== professionalId) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Agendamento não encontrado.",
    });
  }
}

export const appointmentService = {
  async list(
    filters: ListAppointmentsDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment[]> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    );

    const professionalId = isSelfScheduleOnlyRole(auth.membership.roleKey)
      ? await resolveOwnProfessionalId(auth)
      : undefined;

    return appointmentRepository.listByRange({
      clinicId: auth.clinicId,
      from: filters.from,
      to: filters.to,
      professionalId,
    });
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<Appointment> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    );

    const appointment = await appointmentRepository.findById(id, auth.clinicId);
    if (!appointment) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      });
    }

    if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
      assertOwnsAppointment(appointment, await resolveOwnProfessionalId(auth));
    }

    return appointment;
  },

  /**
   * Clinic hours for the calendar grid (same fallback as availability checks).
   */
  async getCalendarHours(ctx: AuthRequestContext): Promise<ClinicWeeklyHours> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    );
    const { weeklyHours } = await clinicHoursService.getAvailabilityContext(
      auth.clinicId,
    );
    return weeklyHours;
  },

  async create(
    data: CreateAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE);

    if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
      const ownProfessionalId = await resolveOwnProfessionalId(auth);
      if (data.professionalId !== ownProfessionalId) {
        throw new AppError(ErrorCode.FORBIDDEN, {
          message: "Você só pode criar agendamentos para si mesmo.",
        });
      }
    }

    const patientExists = await appointmentRepository.patientExists(
      data.patientId,
      auth.clinicId,
    );
    if (!patientExists) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      });
    }

    const affiliation = await appointmentRepository.findProfessionalAffiliation(
      data.professionalId,
      auth.clinicId,
    );
    if (!affiliation) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado nesta clínica.",
      });
    }
    if (
      affiliation.professionalStatus !== "active" ||
      affiliation.affiliationStatus !== "active"
    ) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Profissional inativo nesta clínica.",
      });
    }

    await professionalAvailabilityService.ensureAvailable({
      clinicId: auth.clinicId,
      professionalId: data.professionalId,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    });

    return appointmentRepository.create({
      clinicId: auth.clinicId,
      createdBy: auth.user.id,
      data,
    });
  },

  async cancel(
    data: CancelAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    );

    const existing = await appointmentRepository.findById(
      data.id,
      auth.clinicId,
    );
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      });
    }

    if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
      assertOwnsAppointment(existing, await resolveOwnProfessionalId(auth));
    }

    if (existing.status === "canceled") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este agendamento já foi cancelado.",
      });
    }

    return appointmentRepository.cancel({
      id: data.id,
      clinicId: auth.clinicId,
      updatedBy: auth.user.id,
      canceledReason: data.canceledReason ?? null,
    });
  },
};
