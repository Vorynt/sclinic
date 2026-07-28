import { z } from "zod"

export const listActiveChargesByAppointmentsSchema = z.object({
  appointmentIds: z.array(z.string().uuid()).max(200),
})

export type ListActiveChargesByAppointmentsInput = z.infer<
  typeof listActiveChargesByAppointmentsSchema
>
