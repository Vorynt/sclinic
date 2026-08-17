import { describe, expect, it } from "@jest/globals"

import { toAccountMembershipSummary } from "@/modules/users/mappers/account.mapper"
import { updateAccountProfileSchema, leaveOwnClinicSchema } from "@/modules/users/schemas/account.schema"

describe("updateAccountProfileSchema", () => {
  it("accepts name and optional phone", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "11999998888",
    })

    expect(parsed.name).toBe("Ana Silva")
    expect(parsed.phone).toBe("11999998888")
  })

  it("normalizes empty phone to null", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "   ",
    })

    expect(parsed.phone).toBe(null)
  })

  it("rejects short phone when provided", () => {
    expect(() => updateAccountProfileSchema.parse({
              name: "Ana Silva",
              phone: "123",
            })).toThrow()
  })

  it("rejects empty name", () => {
    expect(() => updateAccountProfileSchema.parse({
              name: "  ",
            })).toThrow()
  })
})

describe("leaveOwnClinicSchema", () => {
  it("accepts a clinic uuid", () => {
    const parsed = leaveOwnClinicSchema.parse({
      clinicId: "11111111-1111-4111-8111-111111111111",
    })
    expect(parsed.clinicId).toBe("11111111-1111-4111-8111-111111111111")
  })

  it("rejects an invalid clinic id", () => {
    expect(leaveOwnClinicSchema.safeParse({ clinicId: "x" }).success).toBe(
      false,
    )
  })
})

describe("toAccountMembershipSummary", () => {
  const base = {
    clinicId: "11111111-1111-4111-8111-111111111111",
    clinicName: "Clínica Aurora",
    roleName: "Recepcionista",
    roleKey: "receptionist",
    status: "active" as const,
    isDefault: false,
    isCurrent: false,
  }

  it("marks living subscription statuses as entitled", () => {
    const mapped = toAccountMembershipSummary({
      ...base,
      clinicSubscriptionStatus: "active",
    })
    expect(mapped.isEntitled).toBe(true)
    expect(mapped.clinicSubscriptionStatus).toBe("active")
  })

  it("marks canceled and missing status as not entitled", () => {
    expect(
      toAccountMembershipSummary({
        ...base,
        clinicSubscriptionStatus: "canceled",
      }).isEntitled,
    ).toBe(false)
    expect(
      toAccountMembershipSummary({
        ...base,
        clinicSubscriptionStatus: null,
      }).isEntitled,
    ).toBe(false)
  })
})