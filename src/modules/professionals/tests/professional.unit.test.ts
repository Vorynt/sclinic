import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  ACCOUNT_STATUS_LABELS,
  AFFILIATION_TYPE_LABELS,
  formatProfessionalDisplayName,
  PROFESSIONAL_ROLE_KEYS,
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
  it("accepts doctor role and lowercases email without name", () => {
    const parsed = createProfessionalSchema.parse({
      email: "Ana@Clinic.COM",
      roleKey: "doctor",
      affiliationType: "attending",
    })
    assert.equal(parsed.email, "ana@clinic.com")
    assert.equal(parsed.roleKey, "doctor")
    assert.equal(parsed.affiliationType, "attending")
    assert.equal("name" in parsed, false)
  })

  it("accepts nurse role", () => {
    const parsed = createProfessionalSchema.parse({
      email: "carlos@clinic.com",
      roleKey: "nurse",
      affiliationType: "locum",
    })
    assert.equal(parsed.roleKey, "nurse")
  })

  it("rejects admin as professional role", () => {
    const result = createProfessionalSchema.safeParse({
      email: "ana@clinic.com",
      roleKey: "admin",
      affiliationType: "attending",
    })
    assert.equal(result.success, false)
  })

  it("rejects missing email", () => {
    const result = createProfessionalSchema.safeParse({
      email: "",
      roleKey: "doctor",
      affiliationType: "attending",
    })
    assert.equal(result.success, false)
  })
})

describe("updateProfessionalInviteProfileSchema", () => {
  it("requires fullName and treatmentPronoun", () => {
    const parsed = updateProfessionalInviteProfileSchema.parse({
      token: "invite-token",
      fullName: " Ana Beatriz ",
      treatmentPronoun: "dra",
    })
    assert.equal(parsed.fullName, "Ana Beatriz")
    assert.equal(parsed.treatmentPronoun, "dra")
  })

  it("rejects missing treatmentPronoun", () => {
    const result = updateProfessionalInviteProfileSchema.safeParse({
      token: "invite-token",
      fullName: "Ana Beatriz",
    })
    assert.equal(result.success, false)
  })
})

describe("updateProfessionalSchema", () => {
  it("accepts name or fullName and requires at least one field", () => {
    const byName = updateProfessionalSchema.parse({
      id: VALID_UUID,
      name: "Ana Atualizada",
    })
    assert.equal(byName.name, "Ana Atualizada")

    const byFullName = updateProfessionalSchema.parse({
      id: VALID_UUID,
      fullName: "Ana Completa",
    })
    assert.equal(byFullName.fullName, "Ana Completa")

    const byPronoun = updateProfessionalSchema.parse({
      id: VALID_UUID,
      treatmentPronoun: "dr",
    })
    assert.equal(byPronoun.treatmentPronoun, "dr")

    assert.equal(
      updateProfessionalSchema.safeParse({ id: VALID_UUID }).success,
      false,
    )
  })
})

describe("professionals constants", () => {
  it("exposes doctor and nurse role keys", () => {
    assert.deepEqual([...PROFESSIONAL_ROLE_KEYS], ["doctor", "nurse"])
  })

  it("exposes treatment pronoun labels", () => {
    assert.deepEqual([...TREATMENT_PRONOUN_KEYS], [
      "dr",
      "dra",
      "sr",
      "sra",
      "enf",
      "enfa",
    ])
    assert.equal(TREATMENT_PRONOUN_LABELS.dra, "Dra.")
    assert.equal(TREATMENT_PRONOUN_LABELS.enf, "Enf.")
  })

  it("formats display name with treatment pronoun", () => {
    assert.equal(
      formatProfessionalDisplayName({
        fullName: "Ana Silva",
        treatmentPronoun: "dra",
      }),
      "Dra. Ana Silva",
    )
    assert.equal(
      formatProfessionalDisplayName({ fullName: null, fallback: "—" }),
      "—",
    )
  })

  it("exposes account status labels in Portuguese", () => {
    assert.equal(ACCOUNT_STATUS_LABELS.invite_pending, "Convite pendente")
    assert.equal(ACCOUNT_STATUS_LABELS.invite_expired, "Convite expirado")
    assert.equal(ACCOUNT_STATUS_LABELS.invite_revoked, "Convite cancelado")
    assert.equal(ACCOUNT_STATUS_LABELS.active, "Ativo")
    assert.equal(ACCOUNT_STATUS_LABELS.inactive, "Inativo")
  })

  it("exposes affiliation type labels", () => {
    assert.equal(AFFILIATION_TYPE_LABELS.attending, "Assistente")
    assert.equal(AFFILIATION_TYPE_LABELS.coordinator, "Coordenador(a)")
  })
})

describe("computeAccountStatus", () => {
  const now = new Date("2026-07-23T12:00:00.000Z")

  it("returns invite_pending for open non-expired invitation", () => {
    assert.equal(
      computeAccountStatus({
        invitationStatus: "pending",
        invitationExpiresAt: new Date("2026-07-30T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      }),
      "invite_pending",
    )
  })

  it("returns invite_expired when past expiresAt", () => {
    assert.equal(
      computeAccountStatus({
        invitationStatus: "pending",
        invitationExpiresAt: new Date("2026-07-01T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      }),
      "invite_expired",
    )
  })

  it("returns invite_revoked for revoked invitation", () => {
    assert.equal(
      computeAccountStatus({
        invitationStatus: "revoked",
        invitationExpiresAt: new Date("2026-07-30T12:00:00.000Z"),
        professionalStatus: "inactive",
        affiliationStatus: "inactive",
        now,
      }),
      "invite_revoked",
    )
  })

  it("returns inactive or active from professional/affiliation when no open invite", () => {
    assert.equal(
      computeAccountStatus({
        invitationStatus: null,
        invitationExpiresAt: null,
        professionalStatus: "inactive",
        affiliationStatus: "active",
        now,
      }),
      "inactive",
    )
    assert.equal(
      computeAccountStatus({
        invitationStatus: "accepted",
        invitationExpiresAt: null,
        professionalStatus: "active",
        affiliationStatus: "active",
        now,
      }),
      "active",
    )
  })
})

describe("listProfessionalsSchema", () => {
  it("defaults page and pageSize", () => {
    const parsed = listProfessionalsSchema.parse({})
    assert.equal(parsed.page, 1)
    assert.equal(parsed.pageSize, DEFAULT_LIST_PAGE_SIZE)
    assert.equal(parsed.q, undefined)
  })
})

describe("createOwnerClinicalProfileSchema", () => {
  it("accepts doctor profile with required agenda fields", () => {
    const parsed = createOwnerClinicalProfileSchema.parse({
      clinicalPracticeType: "doctor",
      fullName: " Ana Silva ",
      treatmentPronoun: "dra",
      councilType: "CRM",
      councilNumber: "12345",
      councilState: "rj",
      specialty: "Dermatologia",
    })
    assert.equal(parsed.clinicalPracticeType, "doctor")
    assert.equal(parsed.fullName, "Ana Silva")
    assert.equal(parsed.councilState, "RJ")
  })

  it("accepts nurse as clinicalPracticeType", () => {
    const parsed = createOwnerClinicalProfileSchema.parse({
      clinicalPracticeType: "nurse",
      fullName: "Carlos Enfermagem",
      treatmentPronoun: "enf",
      councilType: "COREN",
    })
    assert.equal(parsed.clinicalPracticeType, "nurse")
  })

  it("rejects missing fullName or treatmentPronoun", () => {
    assert.equal(
      createOwnerClinicalProfileSchema.safeParse({
        clinicalPracticeType: "doctor",
        treatmentPronoun: "dr",
      }).success,
      false,
    )
    assert.equal(
      createOwnerClinicalProfileSchema.safeParse({
        clinicalPracticeType: "doctor",
        fullName: "Ana",
      }).success,
      false,
    )
  })
})
