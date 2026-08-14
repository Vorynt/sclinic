import { describe, expect, it } from "@jest/globals"

import {
  ACCOUNT_STATUS_LABELS,
  AFFILIATION_TYPE_LABELS,
  formatProfessionalDisplayName,
  PROFESSIONAL_ROLE_KEYS,
  roleKeyFromProfessionType,
  TREATMENT_PRONOUN_KEYS,
  TREATMENT_PRONOUN_LABELS,
} from "@/modules/professionals/constants/professionals"
import { computeAccountStatus } from "@/modules/professionals/mappers/professional.mapper"
import {
  createProfessionalSchema,
  listProfessionalsSchema,
  updateProfessionalInviteProfileSchema,
  updateProfessionalSchema,
} from "@/modules/professionals/schemas/professional.schema"
import { createOwnerClinicalProfileSchema } from "@/modules/professionals/schemas/owner-clinical-profile.schema"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createProfessionalSchema", () => {
  it("accepts profession type and lowercases email without name", () => {
    const parsed = createProfessionalSchema.parse({
      email: "Ana@Clinic.COM",
      professionType: "physician",
      affiliationType: "attending",
    })
    expect(parsed.email).toBe("ana@clinic.com")
    expect(parsed.professionType).toBe("physician")
    expect(parsed.affiliationType).toBe("attending")
    expect("name" in parsed).toBe(false)
    expect("roleKey" in parsed).toBe(false)
  })

  it("accepts nurse profession type", () => {
    const parsed = createProfessionalSchema.parse({
      email: "carlos@clinic.com",
      professionType: "nurse",
      affiliationType: "locum",
    })
    expect(parsed.professionType).toBe("nurse")
  })

  it("accepts dentist profession type", () => {
    const parsed = createProfessionalSchema.parse({
      email: "dentista@clinic.com",
      professionType: "dentist",
      affiliationType: "attending",
    })
    expect(parsed.professionType).toBe("dentist")
  })

  it("rejects admin as profession type", () => {
    const result = createProfessionalSchema.safeParse({
      email: "ana@clinic.com",
      professionType: "admin",
      affiliationType: "attending",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing email", () => {
    const result = createProfessionalSchema.safeParse({
      email: "",
      professionType: "physician",
      affiliationType: "attending",
    })
    expect(result.success).toBe(false)
  })
})

describe("roleKeyFromProfessionType", () => {
  it("maps nurse to nurse role and others to clinician", () => {
    expect(roleKeyFromProfessionType("nurse")).toBe("nurse")
    expect(roleKeyFromProfessionType("physician")).toBe("clinician")
    expect(roleKeyFromProfessionType("dentist")).toBe("clinician")
    expect(roleKeyFromProfessionType("physiotherapist")).toBe("clinician")
  })
})

describe("updateProfessionalInviteProfileSchema", () => {
  it("requires fullName and treatmentPronoun", () => {
    const parsed = updateProfessionalInviteProfileSchema.parse({
      token: "invite-token",
      fullName: " Ana Beatriz ",
      treatmentPronoun: "dra",
    })
    expect(parsed.fullName).toBe("Ana Beatriz")
    expect(parsed.treatmentPronoun).toBe("dra")
  })

  it("rejects missing treatmentPronoun", () => {
    const result = updateProfessionalInviteProfileSchema.safeParse({
      token: "invite-token",
      fullName: "Ana Beatriz",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateProfessionalSchema", () => {
  it("accepts name or fullName and requires at least one field", () => {
    const byName = updateProfessionalSchema.parse({
      id: VALID_UUID,
      name: "Ana Atualizada",
    })
    expect(byName.name).toBe("Ana Atualizada")

    const byFullName = updateProfessionalSchema.parse({
      id: VALID_UUID,
      fullName: "Ana Completa",
    })
    expect(byFullName.fullName).toBe("Ana Completa")

    const byPronoun = updateProfessionalSchema.parse({
      id: VALID_UUID,
      treatmentPronoun: "dr",
    })
    expect(byPronoun.treatmentPronoun).toBe("dr")

    expect(updateProfessionalSchema.safeParse({ id: VALID_UUID }).success).toBe(false)
  })
})

describe("professionals constants", () => {
  it("exposes clinician and nurse role keys", () => {
    expect([...PROFESSIONAL_ROLE_KEYS]).toEqual(["clinician", "nurse"])
  })

  it("exposes treatment pronoun labels", () => {
    expect([...TREATMENT_PRONOUN_KEYS]).toEqual([
      "dr",
      "dra",
      "sr",
      "sra",
      "enf",
      "enfa",
      "ft",
      "fta",
    ])
    expect(TREATMENT_PRONOUN_LABELS.dra).toBe("Dra.")
    expect(TREATMENT_PRONOUN_LABELS.enf).toBe("Enf.")
    expect(TREATMENT_PRONOUN_LABELS.ft).toBe("Ft.")
  })

  it("formats display name with treatment pronoun", () => {
    expect(formatProfessionalDisplayName({
        fullName: "Ana Silva",
        treatmentPronoun: "dra",
      })).toBe("Dra. Ana Silva")
    expect(formatProfessionalDisplayName({ fullName: null, fallback: "—" })).toBe("—")
  })

  it("exposes account status labels in Portuguese", () => {
    expect(ACCOUNT_STATUS_LABELS.invite_pending).toBe("Convite pendente")
    expect(ACCOUNT_STATUS_LABELS.invite_expired).toBe("Convite expirado")
    expect(ACCOUNT_STATUS_LABELS.invite_revoked).toBe("Convite cancelado")
    expect(ACCOUNT_STATUS_LABELS.active).toBe("Ativo")
    expect(ACCOUNT_STATUS_LABELS.inactive).toBe("Inativo")
  })

  it("exposes affiliation type labels", () => {
    expect(AFFILIATION_TYPE_LABELS.attending).toBe("Assistente")
    expect(AFFILIATION_TYPE_LABELS.coordinator).toBe("Coordenador(a)")
  })
})

describe("computeAccountStatus", () => {
  const now = new Date("2026-07-23T12:00:00.000Z")

  it("returns invite_pending for open non-expired invitation", () => {
    expect(computeAccountStatus({
        invitationStatus: "pending",
        invitationExpiresAt: new Date("2026-07-30T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      })).toBe("invite_pending")
  })

  it("returns invite_expired when past expiresAt", () => {
    expect(computeAccountStatus({
        invitationStatus: "pending",
        invitationExpiresAt: new Date("2026-07-01T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      })).toBe("invite_expired")
  })

  it("returns invite_revoked for revoked invitation", () => {
    expect(computeAccountStatus({
        invitationStatus: "revoked",
        invitationExpiresAt: new Date("2026-07-30T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      })).toBe("invite_revoked")
  })

  it("returns inactive or active from professional/affiliation when no open invite", () => {
    expect(computeAccountStatus({
        invitationStatus: null,
        invitationExpiresAt: null,
        professionalStatus: "inactive",
        affiliationStatus: "active",
        now,
      })).toBe("inactive")
    expect(computeAccountStatus({
        invitationStatus: "accepted",
        invitationExpiresAt: null,
        professionalStatus: "active",
        affiliationStatus: "active",
        now,
      })).toBe("active")
  })
})

describe("listProfessionalsSchema", () => {
  it("defaults page and pageSize", () => {
    const parsed = listProfessionalsSchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(DEFAULT_LIST_PAGE_SIZE)
    expect(parsed.q).toBe(undefined)
  })
})

describe("createOwnerClinicalProfileSchema", () => {
  it("accepts physician profile with required agenda fields", () => {
    const parsed = createOwnerClinicalProfileSchema.parse({
      professionType: "physician",
      fullName: " Ana Silva ",
      treatmentPronoun: "dra",
      councilType: "CRM",
      councilNumber: "12345",
      councilState: "rj",
      specialty: "Dermatologia",
    })
    expect(parsed.professionType).toBe("physician")
    expect(parsed.fullName).toBe("Ana Silva")
    expect(parsed.councilState).toBe("RJ")
  })

  it("accepts nurse as professionType", () => {
    const parsed = createOwnerClinicalProfileSchema.parse({
      professionType: "nurse",
      fullName: "Carlos Enfermagem",
      treatmentPronoun: "enf",
      councilType: "COREN",
    })
    expect(parsed.professionType).toBe("nurse")
  })

  it("rejects missing fullName or treatmentPronoun", () => {
    expect(createOwnerClinicalProfileSchema.safeParse({
        professionType: "physician",
        treatmentPronoun: "dr",
      }).success).toBe(false)
    expect(createOwnerClinicalProfileSchema.safeParse({
        professionType: "physician",
        fullName: "Ana",
      }).success).toBe(false)
  })
})
