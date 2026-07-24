/**
 * Wipes operational data and seeds a demo clinic with realistic volume.
 *
 * Usage:
 *   npm run db:seed:demo
 *
 * Login:
 *   admin@sclinic.local / senha123
 *   (emailVerified = true, mustChangePassword = false)
 */
import { randomUUID } from "node:crypto"

import { hashPassword } from "better-auth/crypto"
import { config } from "dotenv"
import { and, eq, isNull, sql } from "drizzle-orm"

config({ path: ".env.local" })
config({ path: ".env" })

import { db } from "@/db"
import {
  account,
  appointments,
  clinicBusinessHours,
  clinicMemberships,
  clinics,
  invitations,
  patients,
  permissions,
  plans,
  professionalClinics,
  professionals,
  rolePermissions,
  roles,
  session,
  subscriptions,
  user,
  verification,
} from "@/db/schema"
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours"
import { toDbTime } from "@/modules/clinics/mappers/clinic-hours.mapper"

const DEMO_OWNER = {
  name: "Raissa Admin",
  email: "admin@sclinic.local",
  password: "senha123",
} as const

const RLS_TABLES = [
  "appointments",
  "patients",
  "professional_clinics",
  "subscriptions",
  "invitations",
  "clinic_memberships",
  "clinic_business_hours",
  "clinics",
] as const

const SYSTEM_ROLES = [
  {
    key: "owner",
    name: "Owner",
    description: "Clinic owner — full access including billing and members",
  },
  {
    key: "admin",
    name: "Admin",
    description: "Clinic administrator",
  },
  {
    key: "manager",
    name: "Manager",
    description: "Operational manager",
  },
  {
    key: "receptionist",
    name: "Receptionist",
    description: "Front desk — patients and appointments",
  },
  {
    key: "doctor",
    name: "Doctor",
    description: "Health professional with clinical write access",
  },
  {
    key: "nurse",
    name: "Nurse",
    description: "Nursing staff",
  },
  {
    key: "financial",
    name: "Financial",
    description: "Billing and financial views",
  },
] as const

const PERMISSIONS = [
  { key: "patients.read", name: "Read patients", module: "patients" },
  { key: "patients.write", name: "Write patients", module: "patients" },
  {
    key: "appointments.create",
    name: "Create appointments",
    module: "appointments",
  },
  {
    key: "appointments.update",
    name: "Update appointments",
    module: "appointments",
  },
  {
    key: "appointments.delete",
    name: "Delete appointments",
    module: "appointments",
  },
  {
    key: "professionals.manage",
    name: "Manage professionals",
    module: "professionals",
  },
  { key: "financial.view", name: "View financial", module: "billing" },
  { key: "financial.manage", name: "Manage financial", module: "billing" },
  {
    key: "settings.manage",
    name: "Manage clinic settings",
    module: "settings",
  },
  { key: "members.invite", name: "Invite members", module: "settings" },
  {
    key: "records.read",
    name: "Read medical records",
    module: "medical-records",
  },
  {
    key: "records.write",
    name: "Write medical records",
    module: "medical-records",
  },
] as const

const ROLE_PERMISSION_MATRIX: Record<string, readonly string[]> = {
  owner: PERMISSIONS.map((p) => p.key),
  admin: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "professionals.manage",
    "financial.view",
    "financial.manage",
    "settings.manage",
    "members.invite",
    "records.read",
    "records.write",
  ],
  manager: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "professionals.manage",
    "financial.view",
    "members.invite",
    "records.read",
  ],
  receptionist: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
  ],
  doctor: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
  ],
  nurse: [
    "patients.read",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
  ],
  financial: ["patients.read", "financial.view", "financial.manage"],
}

const STUB_PLANS = [
  {
    name: "Essencial",
    description: "Para clínicas começando a digitalizar o atendimento.",
    priceCents: 9900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 3,
    maxProfessionals: 2,
    maxStorageBytes: 1 * 1024 * 1024 * 1024,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: "Profissional",
    description: "Operação completa com mais usuários e profissionais.",
    priceCents: 19900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 10,
    maxProfessionals: 8,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    stripePriceId: null,
    isActive: true,
  },
  {
    name: "Enterprise",
    description: "Limites ampliados para redes e alto volume.",
    priceCents: 39900,
    currency: "BRL",
    billingCycle: "monthly" as const,
    maxUsers: 50,
    maxProfessionals: 40,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    stripePriceId: null,
    isActive: true,
  },
]

const PROFESSIONAL_SEEDS = [
  {
    fullName: "Dra. Ana Beatriz Nogueira",
    specialty: "Clínica Geral",
    councilType: "CRM" as const,
    councilNumber: "123456",
    councilState: "SP",
  },
  {
    fullName: "Dr. Carlos Eduardo Mendes",
    specialty: "Cardiologia",
    councilType: "CRM" as const,
    councilNumber: "234567",
    councilState: "SP",
  },
  {
    fullName: "Dra. Fernanda Lima Rocha",
    specialty: "Dermatologia",
    councilType: "CRM" as const,
    councilNumber: "345678",
    councilState: "SP",
  },
  {
    fullName: "Dr. Gustavo Henrique Alves",
    specialty: "Ortopedia",
    councilType: "CRM" as const,
    councilNumber: "456789",
    councilState: "SP",
  },
  {
    fullName: "Dra. Juliana Costa Ribeiro",
    specialty: "Pediatria",
    councilType: "CRM" as const,
    councilNumber: "567890",
    councilState: "SP",
  },
  {
    fullName: "Dr. Marcos Vinícius Prado",
    specialty: "Psiquiatria",
    councilType: "CRM" as const,
    councilNumber: "678901",
    councilState: "SP",
  },
  {
    fullName: "Enf. Patricia Souza Almeida",
    specialty: "Enfermagem",
    councilType: "COREN" as const,
    councilNumber: "789012",
    councilState: "SP",
  },
  {
    fullName: "Dra. Renata Oliveira Campos",
    specialty: "Ginecologia",
    councilType: "CRM" as const,
    councilNumber: "890123",
    councilState: "SP",
  },
]

const FIRST_NAMES = [
  "Maria",
  "João",
  "Ana",
  "Pedro",
  "Julia",
  "Lucas",
  "Beatriz",
  "Rafael",
  "Camila",
  "Bruno",
  "Larissa",
  "Felipe",
  "Amanda",
  "Thiago",
  "Isabela",
  "Diego",
  "Patricia",
  "André",
  "Gabriela",
  "Rodrigo",
  "Carolina",
  "Vinicius",
  "Aline",
  "Marcelo",
  "Tatiane",
  "Eduardo",
  "Vanessa",
  "Ricardo",
  "Priscila",
  "Leandro",
  "Natalia",
  "Henrique",
  "Daniela",
  "Paulo",
  "Fernanda",
  "Alexandre",
  "Cristina",
  "Roberto",
  "Simone",
  "Fabio",
  "Elaine",
  "Gustavo",
  "Monica",
  "Sergio",
  "Luciana",
]

const LAST_NAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Alves",
  "Pereira",
  "Lima",
  "Gomes",
  "Costa",
  "Ribeiro",
  "Martins",
  "Carvalho",
  "Rocha",
  "Almeida",
  "Nascimento",
  "Araújo",
  "Melo",
  "Barbosa",
  "Cardoso",
  "Teixeira",
  "Correia",
  "Dias",
  "Cavalcanti",
  "Moreira",
  "Nunes",
  "Mendes",
  "Freitas",
  "Pinto",
]

const REASONS = [
  "Consulta de rotina",
  "Retorno de exames",
  "Dor de cabeça persistente",
  "Acompanhamento clínico",
  "Avaliação pré-operatória",
  "Queixa respiratória",
  "Check-up anual",
  "Renovação de receita",
  "Dor articular",
  "Orientação nutricional",
]

const APPOINTMENT_TYPES = [
  "consultation",
  "follow_up",
  "procedure",
  "evaluation",
  "other",
] as const

const PAST_STATUSES = [
  "completed",
  "completed",
  "completed",
  "canceled",
  "no_show",
] as const

const FUTURE_STATUSES = [
  "scheduled",
  "scheduled",
  "confirmed",
  "confirmed",
  "checked_in",
] as const

function cpfCheckDigit(base: string, factor: number): number {
  let sum = 0
  for (let i = 0; i < base.length; i += 1) {
    sum += Number(base[i]) * (factor - i)
  }
  const rest = (sum * 10) % 11
  return rest === 10 ? 0 : rest
}

/** Deterministic valid CPF from a positive index (digits only). */
function cpfFromIndex(index: number): string {
  const base = String(100_000_000 + index).slice(0, 9)
  const d1 = cpfCheckDigit(base, 10)
  const d2 = cpfCheckDigit(`${base}${d1}`, 11)
  return `${base}${d1}${d2}`
}

function phoneFromIndex(index: number): string {
  const suffix = String(90000_000 + index).slice(-8)
  return `119${suffix}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function atLocalTime(date: Date, hour: number, minute: number): Date {
  const next = new Date(date)
  next.setHours(hour, minute, 0, 0)
  return next
}

async function disableRls() {
  for (const table of RLS_TABLES) {
    await db.execute(
      sql.raw(`ALTER TABLE IF EXISTS ${table} DISABLE ROW LEVEL SECURITY`),
    )
  }
}

async function enableRls() {
  for (const table of RLS_TABLES) {
    await db.execute(
      sql.raw(`ALTER TABLE IF EXISTS ${table} ENABLE ROW LEVEL SECURITY`),
    )
    await db.execute(
      sql.raw(`ALTER TABLE IF EXISTS ${table} FORCE ROW LEVEL SECURITY`),
    )
  }
}

async function wipeAllData() {
  await db.execute(sql`
    TRUNCATE TABLE
      appointments,
      patients,
      professional_clinics,
      professionals,
      invitations,
      clinic_memberships,
      clinic_business_hours,
      subscriptions,
      clinics,
      role_permissions,
      permissions,
      roles,
      plans,
      session,
      account,
      verification,
      "user"
    RESTART IDENTITY CASCADE
  `)
}

async function seedRbac() {
  await db.insert(roles).values(
    SYSTEM_ROLES.map((role) => ({
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: true,
      clinicId: null,
    })),
  )

  await db.insert(permissions).values([...PERMISSIONS])

  const allRoles = await db
    .select()
    .from(roles)
    .where(and(eq(roles.isSystem, true), isNull(roles.clinicId)))

  const allPermissions = await db.select().from(permissions)
  const permissionByKey = new Map(allPermissions.map((p) => [p.key, p.id]))

  const links: { roleId: string; permissionId: string }[] = []
  for (const role of allRoles) {
    for (const key of ROLE_PERMISSION_MATRIX[role.key] ?? []) {
      const permissionId = permissionByKey.get(key)
      if (!permissionId) continue
      links.push({ roleId: role.id, permissionId })
    }
  }

  if (links.length > 0) {
    await db.insert(rolePermissions).values(links)
  }

  return allRoles
}

async function seedPlans() {
  await db.insert(plans).values(STUB_PLANS)
  const [professionalPlan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.name, "Profissional"), isNull(plans.deletedAt)))
    .limit(1)

  if (!professionalPlan) {
    throw new Error("Failed to seed Profissional plan")
  }

  return professionalPlan
}

async function seedOwnerUser() {
  const id = randomUUID()
  const passwordHash = await hashPassword(DEMO_OWNER.password)

  await db.insert(user).values({
    id,
    name: DEMO_OWNER.name,
    email: DEMO_OWNER.email,
    emailVerified: true,
    status: "active",
    mustChangePassword: false,
    phone: "11987654321",
    lastLoginAt: new Date(),
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: passwordHash,
  })

  return id
}

async function seedClinic(ownerId: string, planId: string) {
  const [clinic] = await db
    .insert(clinics)
    .values({
      name: "Clínica Horizonte Saúde",
      tradeName: "Horizonte Saúde",
      document: "12.345.678/0001-90",
      email: "contato@horizontesaude.local",
      phone: "1133334444",
      website: "https://horizontesaude.local",
      timezone: "America/Sao_Paulo",
      subscriptionStatus: "active",
      addressStreet: "Av. Paulista",
      addressNumber: "1000",
      addressComplement: "Conj. 1201",
      addressNeighborhood: "Bela Vista",
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: "01310-100",
      createdBy: ownerId,
      updatedBy: ownerId,
    })
    .returning()

  if (!clinic) throw new Error("Failed to create clinic")

  const now = new Date()
  const periodEnd = addDays(now, 30)

  await db.insert(subscriptions).values({
    clinicId: clinic.id,
    planId,
    gateway: "stripe",
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
  })

  const weekly = buildOnboardingHoursDraft()
  await db.insert(clinicBusinessHours).values(
    weekly.map((day) => {
      if (day.isClosed || day.intervals.length === 0) {
        return {
          clinicId: clinic.id,
          dayOfWeek: day.dayOfWeek,
          isClosed: true,
          opensAt: null,
          closesAt: null,
          secondOpensAt: null,
          secondClosesAt: null,
        }
      }

      const [first, second] = day.intervals
      return {
        clinicId: clinic.id,
        dayOfWeek: day.dayOfWeek,
        isClosed: false,
        opensAt: first ? toDbTime(first.opensAt) : null,
        closesAt: first ? toDbTime(first.closesAt) : null,
        secondOpensAt: second ? toDbTime(second.opensAt) : null,
        secondClosesAt: second ? toDbTime(second.closesAt) : null,
      }
    }),
  )

  return clinic.id
}

async function seedMembership(
  ownerId: string,
  clinicId: string,
  ownerRoleId: string,
) {
  await db.insert(clinicMemberships).values({
    userId: ownerId,
    clinicId,
    roleId: ownerRoleId,
    isDefault: true,
    status: "active",
  })
}

async function seedProfessionals(clinicId: string) {
  const inserted = await db
    .insert(professionals)
    .values(
      PROFESSIONAL_SEEDS.map((p) => ({
        fullName: p.fullName,
        specialty: p.specialty,
        councilType: p.councilType,
        councilNumber: p.councilNumber,
        councilState: p.councilState,
        status: "active" as const,
        biography: `Atendimento em ${p.specialty.toLowerCase()} na Clínica Horizonte Saúde.`,
      })),
    )
    .returning()

  await db.insert(professionalClinics).values(
    inserted.map((professional, index) => ({
      professionalId: professional.id,
      clinicId,
      affiliationType: index === 0 ? ("coordinator" as const) : ("attending" as const),
      status: "active" as const,
    })),
  )

  return inserted
}

async function seedPatients(clinicId: string, ownerId: string) {
  const rows = FIRST_NAMES.map((firstName, index) => {
    const lastName = LAST_NAMES[index % LAST_NAMES.length]!
    const gender =
      index % 3 === 0 ? ("female" as const) : index % 3 === 1 ? ("male" as const) : ("undisclosed" as const)
    const birthYear = 1955 + (index % 50)
    const birthMonth = String((index % 12) + 1).padStart(2, "0")
    const birthDay = String((index % 28) + 1).padStart(2, "0")

    return {
      clinicId,
      fullName: `${firstName} ${lastName}`,
      document: cpfFromIndex(index + 1),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@email.local`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
      phone: phoneFromIndex(index),
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      gender,
      status: index % 17 === 0 ? ("inactive" as const) : ("active" as const),
      addressCity: "São Paulo",
      addressState: "SP",
      addressNeighborhood: index % 2 === 0 ? "Pinheiros" : "Moema",
      emergencyContactName: `Contato ${firstName}`,
      emergencyContactPhone: phoneFromIndex(index + 200),
      notes: index % 5 === 0 ? "Paciente preferencial — retorno frequente." : null,
      createdBy: ownerId,
      updatedBy: ownerId,
    }
  })

  return db.insert(patients).values(rows).returning()
}

async function seedAppointments(params: {
  clinicId: string
  ownerId: string
  patientIds: string[]
  professionalIds: string[]
}) {
  const { clinicId, ownerId, patientIds, professionalIds } = params
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slots: {
    dayOffset: number
    hour: number
    minute: number
  }[] = []

  for (let dayOffset = -21; dayOffset <= 21; dayOffset += 1) {
    const weekday = addDays(today, dayOffset).getDay()
    if (weekday === 0) continue

    const hours =
      weekday === 6
        ? [8, 9, 10, 11]
        : [8, 9, 10, 11, 14, 15, 16, 17]

    for (const hour of hours) {
      slots.push({ dayOffset, hour, minute: 0 })
      if (weekday !== 6 && (hour === 9 || hour === 15)) {
        slots.push({ dayOffset, hour, minute: 30 })
      }
    }
  }

  // ~90 appointments — dense enough for calendar/list demos
  const selected = slots.filter((_, index) => index % 3 !== 0).slice(0, 90)

  const rows = selected.map((slot, index) => {
    const startsAt = atLocalTime(addDays(today, slot.dayOffset), slot.hour, slot.minute)
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)
    const isPast = startsAt.getTime() < Date.now()
    const status = isPast
      ? PAST_STATUSES[index % PAST_STATUSES.length]!
      : FUTURE_STATUSES[index % FUTURE_STATUSES.length]!

    return {
      clinicId,
      patientId: patientIds[index % patientIds.length]!,
      professionalId: professionalIds[index % professionalIds.length]!,
      startsAt,
      endsAt,
      type: APPOINTMENT_TYPES[index % APPOINTMENT_TYPES.length]!,
      status,
      reason: REASONS[index % REASONS.length]!,
      notes: index % 7 === 0 ? "Observação administrativa do agendamento." : null,
      canceledAt: status === "canceled" ? startsAt : null,
      canceledReason: status === "canceled" ? "Paciente solicitou remarcação." : null,
      createdBy: ownerId,
      updatedBy: ownerId,
    }
  })

  await db.insert(appointments).values(rows)
  return rows.length
}

async function seed() {
  console.log("Disabling RLS for seed…")
  await disableRls()

  try {
    console.log("Wiping database…")
    await wipeAllData()

    console.log("Seeding RBAC + plans…")
    const allRoles = await seedRbac()
    const professionalPlan = await seedPlans()
    const ownerRole = allRoles.find((role) => role.key === "owner")
    if (!ownerRole) throw new Error("Owner role missing after RBAC seed")

    console.log("Seeding owner user…")
    const ownerId = await seedOwnerUser()

    console.log("Seeding clinic, hours, subscription…")
    const clinicId = await seedClinic(ownerId, professionalPlan.id)
    await seedMembership(ownerId, clinicId, ownerRole.id)

    console.log("Seeding professionals…")
    const professionalRows = await seedProfessionals(clinicId)

    console.log("Seeding patients…")
    const patientRows = await seedPatients(clinicId, ownerId)

    console.log("Seeding appointments…")
    const appointmentCount = await seedAppointments({
      clinicId,
      ownerId,
      patientIds: patientRows.map((p) => p.id),
      professionalIds: professionalRows.map((p) => p.id),
    })

    console.log("\nDemo seed completed.")
    console.log(`  Clinic: Clínica Horizonte Saúde (${clinicId})`)
    console.log(`  Professionals: ${professionalRows.length}`)
    console.log(`  Patients: ${patientRows.length}`)
    console.log(`  Appointments: ${appointmentCount}`)
    console.log(`  Login: ${DEMO_OWNER.email} / ${DEMO_OWNER.password}`)
  } finally {
    console.log("Re-enabling RLS…")
    await enableRls()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
