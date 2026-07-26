/**
 * Wipes operational data and seeds a demo clinic with realistic volume.
 *
 * Usage:
 *   npm run db:seed:demo
 *
 * Login (all users — emailVerified = true, mustChangePassword = false):
 *   admin@sclinic.local / senha123          (owner)
 *   marina.souza@sclinic.local / senha123   (admin)
 *   roberto.ferreira@sclinic.local / senha123 (manager)
 *   camila.dias@sclinic.local / senha123    (receptionist)
 *   lucas.martins@sclinic.local / senha123  (receptionist)
 *   ana.nogueira@sclinic.local / senha123   (doctor)
 *   carlos.mendes@sclinic.local / senha123  (doctor)
 *   patricia.almeida@sclinic.local / senha123 (nurse)
 *   helena.barbosa@sclinic.local / senha123 (financial)
 *   tiago.ramos@sclinic.local / senha123    (manager, suspended)
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
  auditLogs,
  charges,
  clinicBusinessHours,
  clinicMemberships,
  clinics,
  clinicalNotes,
  invitations,
  patientClinicalAlerts,
  patients,
  payments,
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
  vitalSigns,
} from "@/db/schema"
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/modules/audit/constants/audit"
import { buildOnboardingHoursDraft } from "@/modules/clinics/constants/default-hours"
import { toDbTime } from "@/modules/clinics/mappers/clinic-hours.mapper"
import {
  createInviteToken,
  hashInviteToken,
} from "@/modules/users/utils/invite-token"

const DEMO_PASSWORD = "senha123" as const

const DEMO_OWNER = {
  name: "Raissa Admin",
  email: "admin@sclinic.local",
  password: DEMO_PASSWORD,
} as const

type DemoTeamRoleKey =
  | "admin"
  | "manager"
  | "receptionist"
  | "doctor"
  | "nurse"
  | "financial"

type DemoTeamMemberSeed = {
  name: string
  email: string
  phone: string
  roleKey: DemoTeamRoleKey
  /** Membership status — default active. */
  status?: "active" | "suspended"
  /** When set, links this user to a professional profile by full name. */
  professionalFullName?: string
}

/** Staff users (besides owner). Fits Profissional plan maxUsers = 10. */
const DEMO_TEAM_MEMBERS: readonly DemoTeamMemberSeed[] = [
  {
    name: "Marina Souza",
    email: "marina.souza@sclinic.local",
    phone: "11990010001",
    roleKey: "admin",
  },
  {
    name: "Roberto Ferreira",
    email: "roberto.ferreira@sclinic.local",
    phone: "11990010002",
    roleKey: "manager",
  },
  {
    name: "Camila Dias",
    email: "camila.dias@sclinic.local",
    phone: "11990010003",
    roleKey: "receptionist",
  },
  {
    name: "Lucas Martins",
    email: "lucas.martins@sclinic.local",
    phone: "11990010004",
    roleKey: "receptionist",
  },
  {
    name: "Dra. Ana Beatriz Nogueira",
    email: "ana.nogueira@sclinic.local",
    phone: "11990010005",
    roleKey: "doctor",
    professionalFullName: "Ana Beatriz Nogueira",
  },
  {
    name: "Dr. Carlos Eduardo Mendes",
    email: "carlos.mendes@sclinic.local",
    phone: "11990010006",
    roleKey: "doctor",
    professionalFullName: "Carlos Eduardo Mendes",
  },
  {
    name: "Enf. Patricia Souza Almeida",
    email: "patricia.almeida@sclinic.local",
    phone: "11990010007",
    roleKey: "nurse",
    professionalFullName: "Patricia Souza Almeida",
  },
  {
    name: "Helena Barbosa",
    email: "helena.barbosa@sclinic.local",
    phone: "11990010008",
    roleKey: "financial",
  },
  {
    name: "Tiago Ramos",
    email: "tiago.ramos@sclinic.local",
    phone: "11990010009",
    roleKey: "manager",
    status: "suspended",
  },
] as const

const RLS_TABLES = [
  "audit_logs",
  "payments",
  "charges",
  "vital_signs",
  "patient_clinical_alerts",
  "clinical_notes",
  "appointments",
  "patients",
  "professional_clinics",
  "subscriptions",
  "invitations",
  "clinic_memberships",
  "clinic_business_hours",
  "clinics",
] as const

/** Role `key` stays in English; `name` is Portuguese for UI/DB display. */
const SYSTEM_ROLES = [
  {
    key: "owner",
    name: "Proprietário",
    description:
      "Proprietário da clínica — acesso completo incluindo faturamento e membros",
  },
  {
    key: "admin",
    name: "Administrador",
    description: "Administrador da clínica",
  },
  {
    key: "manager",
    name: "Gestor",
    description: "Gestor operacional",
  },
  {
    key: "receptionist",
    name: "Recepcionista",
    description: "Recepcionista — pacientes e agendamentos",
  },
  {
    key: "doctor",
    name: "Médico(a)",
    description: "Profissional de saúde com acesso de escrita clínica",
  },
  {
    key: "nurse",
    name: "Enfermeiro(a)",
    description: "Equipe de enfermagem",
  },
  {
    key: "financial",
    name: "Financeiro",
    description: "Faturamento e visualização financeira",
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
    key: "financial.collect",
    name: "Collect clinical payments",
    module: "billing",
  },
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
  {
    key: "audit.read",
    name: "Read clinic audit logs",
    module: "audit",
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
    "financial.collect",
    "settings.manage",
    "members.invite",
    "records.read",
    "records.write",
    "audit.read",
  ],
  manager: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "professionals.manage",
    "financial.view",
    "financial.collect",
    "members.invite",
    "records.read",
  ],
  receptionist: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "financial.collect",
  ],
  doctor: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
    "financial.collect",
  ],
  nurse: [
    "patients.read",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
  ],
  financial: [
    "patients.read",
    "financial.view",
    "financial.manage",
    "financial.collect",
  ],
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
    fullName: "Ana Beatriz Nogueira",
    treatmentPronoun: "dra" as const,
    specialty: "Clínica Geral",
    councilType: "CRM" as const,
    councilNumber: "123456",
    councilState: "SP",
  },
  {
    fullName: "Carlos Eduardo Mendes",
    treatmentPronoun: "dr" as const,
    specialty: "Cardiologia",
    councilType: "CRM" as const,
    councilNumber: "234567",
    councilState: "SP",
  },
  {
    fullName: "Fernanda Lima Rocha",
    treatmentPronoun: "dra" as const,
    specialty: "Dermatologia",
    councilType: "CRM" as const,
    councilNumber: "345678",
    councilState: "SP",
  },
  {
    fullName: "Gustavo Henrique Alves",
    treatmentPronoun: "dr" as const,
    specialty: "Ortopedia",
    councilType: "CRM" as const,
    councilNumber: "456789",
    councilState: "SP",
  },
  {
    fullName: "Juliana Costa Ribeiro",
    treatmentPronoun: "dra" as const,
    specialty: "Pediatria",
    councilType: "CRM" as const,
    councilNumber: "567890",
    councilState: "SP",
  },
  {
    fullName: "Marcos Vinícius Prado",
    treatmentPronoun: "dr" as const,
    specialty: "Psiquiatria",
    councilType: "CRM" as const,
    councilNumber: "678901",
    councilState: "SP",
  },
  {
    fullName: "Patricia Souza Almeida",
    treatmentPronoun: "enf" as const,
    specialty: "Enfermagem",
    councilType: "COREN" as const,
    councilNumber: "789012",
    councilState: "SP",
  },
  {
    fullName: "Renata Oliveira Campos",
    treatmentPronoun: "dra" as const,
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
  "Renata",
  "Mauricio",
  "Claudia",
  "Otavio",
  "Helena",
  "Igor",
  "Bianca",
  "Caio",
  "Denise",
  "Everton",
  "Flavia",
  "Gilberto",
  "Heloisa",
  "Jonas",
  "Jessica",
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

const PATIENT_COUNT = 90

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
  "Controle de pressão arterial",
  "Avaliação dermatológica",
  "Acompanhamento pediátrico",
  "Queixa gastrointestinal",
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

const CLINICAL_NOTE_TEXTS = [
  "Paciente em bom estado geral. Negou febre, tosse ou dispneia. Exame físico sem alterações relevantes. Conduta: manter acompanhamento e retornar em 30 dias.",
  "Queixa de cefaleia há 5 dias, sem sinais de alarme. Orientado hidratação, analgesia e observação. Solicitados exames laboratoriais de rotina.",
  "Retorno com exames. Resultados dentro da normalidade. Ajuste de posologia da medicação em uso. Paciente compreendeu as orientações.",
  "Avaliação cardiológica: PA controlada, FC regular. ECG sem alterações agudas. Manter anti-hipertensivo e dieta hipossódica.",
  "Paciente refere melhora parcial da dor articular. Prescrito anti-inflamatório por 5 dias e fisioterapia. Reavaliar em duas semanas.",
  "Consulta pediátrica de rotina. Crescimento e desenvolvimento adequados para a idade. Vacinação em dia. Orientações alimentares reforçadas.",
  "Dermatite em região de cotovelo com melhora após corticoide tópico. Manter hidratação cutânea. Alta do episódio atual.",
  "Renovação de receita de uso contínuo. Sem efeitos adversos relatados. Exames recentes estáveis. Próximo retorno em 90 dias.",
]

/** Typical private-practice consultation fees (BRL cents). */
const CHARGE_AMOUNT_CENTS = [
  15_000, // R$ 150
  18_000,
  20_000,
  22_000,
  25_000,
  28_000,
  30_000,
  35_000,
] as const

const PAYMENT_METHODS = [
  "pix_manual",
  "pix_manual",
  "card",
  "card",
  "cash",
  "transfer",
  "other",
] as const

const CLINICAL_ALERT_SEEDS = [
  {
    kind: "allergy" as const,
    label: "Alergia a penicilina",
    severity: "high" as const,
    notes: "Histórico de urticária e edema de glote. Evitar betalactâmicos.",
  },
  {
    kind: "allergy" as const,
    label: "Alergia a dipirona",
    severity: "medium" as const,
    notes: "Reação cutânea leve em uso prévio.",
  },
  {
    kind: "allergy" as const,
    label: "Alergia a frutos do mar",
    severity: "high" as const,
    notes: null,
  },
  {
    kind: "restriction" as const,
    label: "Restrição a contraste iodado",
    severity: "high" as const,
    notes: "Reação prévia em exame de imagem. Avaliar pré-medicação.",
  },
  {
    kind: "restriction" as const,
    label: "Jejum prolongado contraindicado",
    severity: "medium" as const,
    notes: "Paciente diabético — atenção em preparos de exame.",
  },
  {
    kind: "attention" as const,
    label: "Risco de queda",
    severity: "medium" as const,
    notes: "Histórico de tontura ortostática.",
  },
  {
    kind: "attention" as const,
    label: "Gestante",
    severity: "high" as const,
    notes: "Confirmar idade gestacional antes de prescrições e exames.",
  },
  {
    kind: "attention" as const,
    label: "Uso contínuo de anticoagulante",
    severity: "high" as const,
    notes: "Warfarin — monitorar INR em procedimentos invasivos.",
  },
  {
    kind: "other" as const,
    label: "Preferência por atendimento matutino",
    severity: "low" as const,
    notes: "Disponibilidade reduzida após as 14h.",
  },
  {
    kind: "other" as const,
    label: "Necessita acompanhante",
    severity: "low" as const,
    notes: "Déficit visual — orientar equipe de recepção.",
  },
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

function tiptapDoc(plainText: string) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: plainText }],
      },
    ],
  }
}

function slugifyEmailPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
      audit_logs,
      payments,
      charges,
      vital_signs,
      patient_clinical_alerts,
      clinical_notes,
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

async function seedCredentialUser(params: {
  name: string
  email: string
  phone: string
  passwordHash: string
}) {
  const id = randomUUID()

  await db.insert(user).values({
    id,
    name: params.name,
    email: params.email,
    emailVerified: true,
    status: "active",
    mustChangePassword: false,
    phone: params.phone,
    lastLoginAt: new Date(),
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: params.passwordHash,
  })

  return id
}

async function seedOwnerUser(passwordHash: string) {
  return seedCredentialUser({
    name: DEMO_OWNER.name,
    email: DEMO_OWNER.email,
    phone: "11987654321",
    passwordHash,
  })
}

async function seedTeamMembers(params: {
  clinicId: string
  rolesByKey: Map<string, string>
  passwordHash: string
}) {
  const { clinicId, rolesByKey, passwordHash } = params
  const seeded: {
    userId: string
    email: string
    name: string
    roleKey: string
    status: string
    professionalFullName?: string
  }[] = []

  for (const member of DEMO_TEAM_MEMBERS) {
    const roleId = rolesByKey.get(member.roleKey)
    if (!roleId) {
      throw new Error(`Role missing for team member: ${member.roleKey}`)
    }

    const userId = await seedCredentialUser({
      name: member.name,
      email: member.email,
      phone: member.phone,
      passwordHash,
    })

    const status = member.status ?? "active"

    await db.insert(clinicMemberships).values({
      userId,
      clinicId,
      roleId,
      isDefault: true,
      status,
    })

    seeded.push({
      userId,
      email: member.email,
      name: member.name,
      roleKey: member.roleKey,
      status,
      professionalFullName: member.professionalFullName,
    })
  }

  return seeded
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

async function seedProfessionals(params: {
  clinicId: string
  userIdByProfessionalName: Map<string, string>
}) {
  const { clinicId, userIdByProfessionalName } = params

  const inserted = await db
    .insert(professionals)
    .values(
      PROFESSIONAL_SEEDS.map((p) => ({
        fullName: p.fullName,
        treatmentPronoun: p.treatmentPronoun,
        specialty: p.specialty,
        councilType: p.councilType,
        councilNumber: p.councilNumber,
        councilState: p.councilState,
        status: "active" as const,
        biography: `Atendimento em ${p.specialty.toLowerCase()} na Clínica Horizonte Saúde.`,
        userId: userIdByProfessionalName.get(p.fullName) ?? null,
      })),
    )
    .returning()

  await db.insert(professionalClinics).values(
    inserted.map((professional, index) => ({
      professionalId: professional.id,
      clinicId,
      affiliationType:
        index === 0
          ? ("coordinator" as const)
          : index === inserted.length - 1
            ? ("locum" as const)
            : index === 3
              ? ("resident" as const)
              : ("attending" as const),
      status: "active" as const,
    })),
  )

  return inserted
}

async function seedPatients(clinicId: string, ownerId: string) {
  const rows = Array.from({ length: PATIENT_COUNT }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length]!
    const lastName = LAST_NAMES[index % LAST_NAMES.length]!
    const secondLast =
      LAST_NAMES[(index * 3 + 7) % LAST_NAMES.length]!
    const gender =
      index % 4 === 0
        ? ("female" as const)
        : index % 4 === 1
          ? ("male" as const)
          : index % 4 === 2
            ? ("other" as const)
            : ("undisclosed" as const)
    const birthYear = 1948 + (index % 55)
    const birthMonth = String((index % 12) + 1).padStart(2, "0")
    const birthDay = String((index % 28) + 1).padStart(2, "0")
    const status =
      index % 23 === 0
        ? ("inactive" as const)
        : index % 31 === 0
          ? ("archived" as const)
          : ("active" as const)

    const fullName = `${firstName} ${lastName} ${secondLast}`
    const emailLocal = slugifyEmailPart(`${firstName}.${lastName}${index}`)

    return {
      clinicId,
      fullName,
      socialName:
        index % 11 === 0 ? `${firstName.split(" ")[0]} ${lastName}` : null,
      document: cpfFromIndex(index + 1),
      email: `${emailLocal}@email.local`,
      phone: phoneFromIndex(index),
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      gender,
      status,
      addressStreet: index % 2 === 0 ? "Rua das Flores" : "Av. Brasil",
      addressNumber: String(100 + index),
      addressComplement: index % 5 === 0 ? `Apto ${index + 10}` : null,
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: `0131${String(index % 10)}-1${String(index % 10).padStart(2, "0")}`,
      addressNeighborhood:
        index % 3 === 0 ? "Pinheiros" : index % 3 === 1 ? "Moema" : "Brooklin",
      emergencyContactName: `Contato ${firstName}`,
      emergencyContactPhone: phoneFromIndex(index + 200),
      notes:
        index % 5 === 0
          ? "Paciente preferencial — retorno frequente."
          : index % 9 === 0
            ? "Prefere contato por WhatsApp."
            : null,
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

  for (let dayOffset = -35; dayOffset <= 28; dayOffset += 1) {
    const weekday = addDays(today, dayOffset).getDay()
    if (weekday === 0) continue

    const hours =
      weekday === 6
        ? [8, 9, 10, 11]
        : [8, 9, 10, 11, 14, 15, 16, 17]

    for (const hour of hours) {
      slots.push({ dayOffset, hour, minute: 0 })
      if (weekday !== 6 && (hour === 9 || hour === 15 || hour === 11)) {
        slots.push({ dayOffset, hour, minute: 30 })
      }
    }
  }

  // ~180 appointments — dense calendar + list demos
  const selected = slots.filter((_, index) => index % 2 !== 0).slice(0, 180)

  const rows = selected.map((slot, index) => {
    const startsAt = atLocalTime(
      addDays(today, slot.dayOffset),
      slot.hour,
      slot.minute,
    )
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
      notes:
        index % 7 === 0 ? "Observação administrativa do agendamento." : null,
      canceledAt: status === "canceled" ? startsAt : null,
      canceledReason:
        status === "canceled" ? "Paciente solicitou remarcação." : null,
      createdBy: ownerId,
      updatedBy: ownerId,
    }
  })

  return db.insert(appointments).values(rows).returning()
}

async function seedChargesAndPayments(params: {
  clinicId: string
  ownerId: string
  recordedByUserId: string
  appointments: Array<{
    id: string
    patientId: string
    startsAt: Date
    status: string
  }>
}) {
  const { clinicId, ownerId, recordedByUserId, appointments: appointmentRows } =
    params

  type ChargeInsert = {
    clinicId: string
    patientId: string
    appointmentId: string
    amountCents: number
    currency: string
    status: "pending" | "paid" | "canceled" | "failed"
    description: string
    dueAt: Date
    provider: "none"
    createdBy: string
    updatedBy: string
  }

  const chargeRows: ChargeInsert[] = []
  /** Parallel array: payment method when status is paid, else null. */
  const paymentMethodByChargeIndex: Array<
    (typeof PAYMENT_METHODS)[number] | null
  > = []

  for (const [index, appointment] of appointmentRows.entries()) {
    const amountCents =
      CHARGE_AMOUNT_CENTS[index % CHARGE_AMOUNT_CENTS.length]!
    const dueAt = addDays(appointment.startsAt, 0)
    dueAt.setHours(23, 59, 0, 0)

    const description = `Consulta — ${REASONS[index % REASONS.length]!}`

    // ~1 in 4 future appointments already have a pending charge from booking
    if (
      appointment.status === "scheduled" ||
      appointment.status === "confirmed" ||
      appointment.status === "checked_in"
    ) {
      if (index % 4 !== 0) continue
      chargeRows.push({
        clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amountCents,
        currency: "BRL",
        status: "pending",
        description,
        dueAt,
        provider: "none",
        createdBy: ownerId,
        updatedBy: ownerId,
      })
      paymentMethodByChargeIndex.push(null)
      continue
    }

    if (appointment.status === "canceled") {
      // Some canceled appointments keep a canceled receivable on record
      if (index % 5 !== 0) continue
      chargeRows.push({
        clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amountCents,
        currency: "BRL",
        status: "canceled",
        description,
        dueAt,
        provider: "none",
        createdBy: ownerId,
        updatedBy: ownerId,
      })
      paymentMethodByChargeIndex.push(null)
      continue
    }

    if (appointment.status === "no_show") {
      // Mix of pending (still owed) and canceled (waived)
      const status = index % 3 === 0 ? ("canceled" as const) : ("pending" as const)
      chargeRows.push({
        clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amountCents,
        currency: "BRL",
        status,
        description,
        dueAt,
        provider: "none",
        createdBy: ownerId,
        updatedBy: ownerId,
      })
      paymentMethodByChargeIndex.push(null)
      continue
    }

    if (appointment.status === "completed") {
      // ~70% paid, ~20% pending, ~10% canceled
      const bucket = index % 10
      const status =
        bucket < 7
          ? ("paid" as const)
          : bucket < 9
            ? ("pending" as const)
            : ("canceled" as const)

      chargeRows.push({
        clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amountCents,
        currency: "BRL",
        status,
        description,
        dueAt,
        provider: "none",
        createdBy: ownerId,
        updatedBy: ownerId,
      })
      paymentMethodByChargeIndex.push(
        status === "paid"
          ? PAYMENT_METHODS[index % PAYMENT_METHODS.length]!
          : null,
      )
    }
  }

  if (chargeRows.length === 0) {
    return { charges: 0, payments: 0, chargeIds: [] as string[] }
  }

  const insertedCharges = await db.insert(charges).values(chargeRows).returning()

  const paymentRows = insertedCharges.flatMap((charge, index) => {
    const method = paymentMethodByChargeIndex[index]
    if (charge.status !== "paid" || !method) return []

    const paidAt = new Date(charge.dueAt ?? new Date())
    paidAt.setHours(10 + (index % 8), (index * 11) % 60, 0, 0)

    return [
      {
        clinicId,
        chargeId: charge.id,
        amountCents: charge.amountCents,
        method,
        paidAt,
        provider: "none" as const,
        notes:
          index % 6 === 0 ? "Pagamento registrado na recepção." : null,
        recordedBy: recordedByUserId,
      },
    ]
  })

  if (paymentRows.length > 0) {
    await db.insert(payments).values(paymentRows)
  }

  return {
    charges: insertedCharges.length,
    payments: paymentRows.length,
    chargeIds: insertedCharges.map((c) => c.id),
  }
}

async function seedClinicalNotesAndVitals(params: {
  clinicId: string
  ownerId: string
  appointments: Array<{
    id: string
    patientId: string
    professionalId: string | null
    status: string
  }>
}) {
  const { clinicId, ownerId, appointments: appointmentRows } = params
  const completed = appointmentRows.filter((row) => row.status === "completed")

  const noteRows = completed.map((appointment, index) => {
    const plainText =
      CLINICAL_NOTE_TEXTS[index % CLINICAL_NOTE_TEXTS.length]!
    return {
      clinicId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      content: tiptapDoc(plainText),
      plainText,
      createdBy: ownerId,
      updatedBy: ownerId,
    }
  })

  const vitalRows = completed.map((appointment, index) => {
    const systolic = 110 + (index % 35)
    const diastolic = 70 + (index % 20)
    return {
      clinicId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      systolicMmHg: systolic,
      diastolicMmHg: diastolic,
      heartRateBpm: 62 + (index % 40),
      respiratoryRate: 12 + (index % 8),
      temperatureC: Number((36.1 + (index % 15) * 0.1).toFixed(1)),
      weightKg: Number((55 + (index % 40) + (index % 10) * 0.3).toFixed(1)),
      heightCm: 155 + (index % 30),
      spo2Percent: 95 + (index % 5),
      createdBy: ownerId,
      updatedBy: ownerId,
    }
  })

  if (noteRows.length > 0) {
    await db.insert(clinicalNotes).values(noteRows)
  }
  if (vitalRows.length > 0) {
    await db.insert(vitalSigns).values(vitalRows)
  }

  return { notes: noteRows.length, vitals: vitalRows.length }
}

async function seedClinicalAlerts(params: {
  clinicId: string
  ownerId: string
  patientIds: string[]
}) {
  const { clinicId, ownerId, patientIds } = params
  const rows: {
    clinicId: string
    patientId: string
    kind: (typeof CLINICAL_ALERT_SEEDS)[number]["kind"]
    label: string
    severity: (typeof CLINICAL_ALERT_SEEDS)[number]["severity"]
    notes: string | null
    createdBy: string
    updatedBy: string
  }[] = []

  // ~25 patients with 1–3 alerts each
  const patientsWithAlerts = patientIds.filter((_, index) => index % 3 === 0).slice(0, 25)

  for (const [patientIndex, patientId] of patientsWithAlerts.entries()) {
    const alertCount = 1 + (patientIndex % 3)
    for (let offset = 0; offset < alertCount; offset += 1) {
      const seed =
        CLINICAL_ALERT_SEEDS[
          (patientIndex + offset) % CLINICAL_ALERT_SEEDS.length
        ]!
      rows.push({
        clinicId,
        patientId,
        kind: seed.kind,
        label: seed.label,
        severity: seed.severity,
        notes: seed.notes,
        createdBy: ownerId,
        updatedBy: ownerId,
      })
    }
  }

  if (rows.length > 0) {
    await db.insert(patientClinicalAlerts).values(rows)
  }

  return rows.length
}

async function seedInvitations(params: {
  clinicId: string
  ownerId: string
  rolesByKey: Map<string, string>
  professionals: Array<{ id: string; fullName: string | null; userId: string | null }>
}) {
  const { clinicId, ownerId, rolesByKey, professionals: professionalRows } =
    params

  const receptionistRoleId = rolesByKey.get("receptionist")
  const doctorRoleId = rolesByKey.get("doctor")
  const nurseRoleId = rolesByKey.get("nurse")
  if (!receptionistRoleId || !doctorRoleId || !nurseRoleId) {
    throw new Error("Required roles missing for invitation seed")
  }

  const unlinkedProfessional = professionalRows.find(
    (professional) =>
      professional.userId === null &&
      (professional.fullName?.includes("Fernanda") ?? false),
  )

  const now = new Date()
  const rows = [
    {
      clinicId,
      email: "nova.recepcao@sclinic.local",
      roleId: receptionistRoleId,
      invitedBy: ownerId,
      professionalId: null,
      tokenHash: hashInviteToken(createInviteToken()),
      expiresAt: addDays(now, 7),
      status: "pending" as const,
      acceptedAt: null,
    },
    {
      clinicId,
      email: "fernanda.lima@sclinic.local",
      roleId: doctorRoleId,
      invitedBy: ownerId,
      professionalId: unlinkedProfessional?.id ?? null,
      tokenHash: hashInviteToken(createInviteToken()),
      expiresAt: addDays(now, 7),
      status: "pending" as const,
      acceptedAt: null,
    },
    {
      clinicId,
      email: "enfermeira.convidada@sclinic.local",
      roleId: nurseRoleId,
      invitedBy: ownerId,
      professionalId: null,
      tokenHash: hashInviteToken(createInviteToken()),
      expiresAt: addDays(now, -3),
      status: "expired" as const,
      acceptedAt: null,
    },
    {
      clinicId,
      email: "financeiro.temp@sclinic.local",
      roleId: rolesByKey.get("financial")!,
      invitedBy: ownerId,
      professionalId: null,
      tokenHash: hashInviteToken(createInviteToken()),
      expiresAt: addDays(now, 5),
      status: "revoked" as const,
      acceptedAt: null,
    },
  ]

  await db.insert(invitations).values(rows)
  return rows.length
}

async function seedAuditLogs(params: {
  clinicId: string
  owner: { id: string; name: string; email: string }
  team: Array<{ userId: string; name: string; email: string }>
  patientIds: string[]
  appointmentIds: string[]
  chargeIds: string[]
}) {
  const { clinicId, owner, team, patientIds, appointmentIds, chargeIds } =
    params
  const actors = [
    owner,
    ...team.map((member) => ({
      id: member.userId,
      name: member.name,
      email: member.email,
    })),
  ]

  const actionSpecs: Array<{
    action: string
    entityType: string
    status: "success" | "error"
    changes: Record<string, unknown> | null
    errorMessage?: string
    errorCode?: string
  }> = [
    {
      action: AUDIT_ACTIONS.CLINIC_CREATE,
      entityType: AUDIT_ENTITY_TYPES.CLINIC,
      status: "success",
      changes: {
        after: { name: "Clínica Horizonte Saúde" },
      },
    },
    {
      action: AUDIT_ACTIONS.CLINIC_HOURS_UPSERT,
      entityType: AUDIT_ENTITY_TYPES.CLINIC_HOURS,
      status: "success",
      changes: {
        before: { monday: "closed" },
        after: { monday: "08:00-18:00" },
      },
    },
    {
      action: AUDIT_ACTIONS.CLINIC_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.CLINIC,
      status: "success",
      changes: {
        before: { phone: "1133330000" },
        after: { phone: "1133334444" },
      },
    },
    {
      action: AUDIT_ACTIONS.INVITATION_CREATE,
      entityType: AUDIT_ENTITY_TYPES.INVITATION,
      status: "success",
      changes: { after: { email: "nova.recepcao@sclinic.local" } },
    },
    {
      action: AUDIT_ACTIONS.INVITATION_REVOKE,
      entityType: AUDIT_ENTITY_TYPES.INVITATION,
      status: "success",
      changes: { after: { status: "revoked" } },
    },
    {
      action: AUDIT_ACTIONS.MEMBER_STATUS_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.MEMBER,
      status: "success",
      changes: {
        before: { status: "active" },
        after: { status: "suspended" },
      },
    },
    {
      action: AUDIT_ACTIONS.PATIENT_CREATE,
      entityType: AUDIT_ENTITY_TYPES.PATIENT,
      status: "error",
      changes: null,
      errorMessage: "Documento já cadastrado nesta clínica.",
      errorCode: "PATIENT_DOCUMENT_CONFLICT",
    },
    {
      action: AUDIT_ACTIONS.CHARGE_CREATE,
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      status: "success",
      changes: {
        after: { amountCents: 20_000, status: "pending" },
      },
    },
    {
      action: AUDIT_ACTIONS.CHARGE_MARK_PAID,
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      status: "success",
      changes: {
        before: { status: "pending" },
        after: { status: "paid", method: "pix_manual" },
      },
    },
    {
      action: AUDIT_ACTIONS.CHARGE_CANCEL,
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      status: "success",
      changes: {
        before: { status: "pending" },
        after: { status: "canceled" },
      },
    },
  ]

  const rows = Array.from({ length: 60 }, (_, index) => {
    const actor = actors[index % actors.length]!
    const createdAt = addDays(new Date(), -(index % 40))
    createdAt.setHours(8 + (index % 10), (index * 7) % 60, 0, 0)

    if (index < actionSpecs.length) {
      const spec = actionSpecs[index]!
      const isCharge = spec.entityType === AUDIT_ENTITY_TYPES.CHARGE
      const chargeId =
        chargeIds.length > 0
          ? chargeIds[index % chargeIds.length]!
          : clinicId
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: spec.action,
        status: spec.status,
        entityType: spec.entityType,
        entityId: isCharge ? chargeId : clinicId,
        changes: spec.changes,
        errorMessage: spec.errorMessage ?? null,
        errorCode: spec.errorCode ?? null,
        createdAt,
      }
    }

    const patientId = patientIds[index % patientIds.length]!
    const appointmentId = appointmentIds[index % appointmentIds.length]!
    const chargeId =
      chargeIds.length > 0 ? chargeIds[index % chargeIds.length]! : null
    const cycle = index % 7

    if (cycle === 0) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.PATIENT_CREATE,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: patientId,
        changes: { after: { id: patientId } },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    if (cycle === 1) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.PATIENT_UPDATE,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: patientId,
        changes: {
          before: { phone: phoneFromIndex(index) },
          after: { phone: phoneFromIndex(index + 1) },
        },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    if (cycle === 2) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointmentId,
        changes: { after: { id: appointmentId, status: "scheduled" } },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    if (cycle === 3) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.APPOINTMENT_STATUS_UPDATE,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointmentId,
        changes: {
          before: { status: "scheduled" },
          after: { status: "confirmed" },
        },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    if (cycle === 4) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.APPOINTMENT_RESCHEDULE,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointmentId,
        changes: {
          before: { startsAt: createdAt.toISOString() },
          after: { startsAt: addDays(createdAt, 2).toISOString() },
        },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    if (cycle === 5 && chargeId) {
      return {
        clinicId,
        actorUserId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.CHARGE_MARK_PAID,
        status: "success" as const,
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: chargeId,
        changes: {
          before: { status: "pending" },
          after: { status: "paid", method: "card" },
        },
        errorMessage: null,
        errorCode: null,
        createdAt,
      }
    }

    return {
      clinicId,
      actorUserId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: AUDIT_ACTIONS.APPOINTMENT_CANCEL,
      status: "success" as const,
      entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
      entityId: appointmentId,
      changes: {
        before: { status: "scheduled" },
        after: { status: "canceled", canceledReason: "Remarcação" },
      },
      errorMessage: null,
      errorCode: null,
      createdAt,
    }
  })

  await db.insert(auditLogs).values(rows)
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

    const passwordHash = await hashPassword(DEMO_PASSWORD)
    const rolesByKey = new Map(allRoles.map((role) => [role.key, role.id]))

    console.log("Seeding owner user…")
    const ownerId = await seedOwnerUser(passwordHash)

    console.log("Seeding clinic, hours, subscription…")
    const clinicId = await seedClinic(ownerId, professionalPlan.id)
    await seedMembership(ownerId, clinicId, ownerRole.id)

    console.log("Seeding team members…")
    const teamMembers = await seedTeamMembers({
      clinicId,
      rolesByKey,
      passwordHash,
    })

    const userIdByProfessionalName = new Map(
      teamMembers
        .filter((member) => member.professionalFullName)
        .map((member) => [member.professionalFullName!, member.userId]),
    )

    console.log("Seeding professionals…")
    const professionalRows = await seedProfessionals({
      clinicId,
      userIdByProfessionalName,
    })

    console.log("Seeding patients…")
    const patientRows = await seedPatients(clinicId, ownerId)

    console.log("Seeding appointments…")
    const appointmentRows = await seedAppointments({
      clinicId,
      ownerId,
      patientIds: patientRows.map((p) => p.id),
      professionalIds: professionalRows.map((p) => p.id),
    })

    const financialMember = teamMembers.find(
      (member) => member.roleKey === "financial",
    )
    const recordedByUserId = financialMember?.userId ?? ownerId

    console.log("Seeding clinical charges + payments…")
    const billingCounts = await seedChargesAndPayments({
      clinicId,
      ownerId,
      recordedByUserId,
      appointments: appointmentRows,
    })

    console.log("Seeding clinical notes + vital signs…")
    const clinicalCounts = await seedClinicalNotesAndVitals({
      clinicId,
      ownerId,
      appointments: appointmentRows,
    })

    console.log("Seeding clinical alerts…")
    const alertCount = await seedClinicalAlerts({
      clinicId,
      ownerId,
      patientIds: patientRows.map((p) => p.id),
    })

    console.log("Seeding invitations…")
    const invitationCount = await seedInvitations({
      clinicId,
      ownerId,
      rolesByKey,
      professionals: professionalRows,
    })

    console.log("Seeding audit logs…")
    const auditCount = await seedAuditLogs({
      clinicId,
      owner: {
        id: ownerId,
        name: DEMO_OWNER.name,
        email: DEMO_OWNER.email,
      },
      team: teamMembers,
      patientIds: patientRows.map((p) => p.id),
      appointmentIds: appointmentRows.map((a) => a.id),
      chargeIds: billingCounts.chargeIds ?? [],
    })

    console.log("\nDemo seed completed.")
    console.log(`  Clinic: Clínica Horizonte Saúde (${clinicId})`)
    console.log(`  Team members: ${teamMembers.length + 1} (incl. owner)`)
    for (const member of teamMembers) {
      console.log(
        `    - ${member.email} (${member.roleKey}, ${member.status})`,
      )
    }
    console.log(
      `  Professionals: ${professionalRows.length} (3 linked to login users)`,
    )
    console.log(`  Patients: ${patientRows.length}`)
    console.log(`  Appointments: ${appointmentRows.length}`)
    console.log(`  Charges: ${billingCounts.charges}`)
    console.log(`  Payments: ${billingCounts.payments}`)
    console.log(`  Clinical notes: ${clinicalCounts.notes}`)
    console.log(`  Vital signs: ${clinicalCounts.vitals}`)
    console.log(`  Clinical alerts: ${alertCount}`)
    console.log(`  Invitations: ${invitationCount}`)
    console.log(`  Audit logs: ${auditCount}`)
    console.log(`  Password (all): ${DEMO_PASSWORD}`)
    console.log(`  Owner login: ${DEMO_OWNER.email} / ${DEMO_PASSWORD}`)
  } finally {
    console.log("Re-enabling RLS…")
    await enableRls()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
