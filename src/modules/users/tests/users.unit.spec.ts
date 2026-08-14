import { describe, expect, it } from "@jest/globals"

import {
  ASSIGNABLE_ROLE_KEYS,
  getRoleLabel,
} from "@/modules/users/constants/users"
import {
  inviteMemberSchema,
  setPasswordFromInviteSchema,
} from "@/modules/users/schemas/invitation.schema"
import { updateMemberRoleSchema, listMembersSchema } from "@/modules/users/schemas/member.schema"
import {
  createInviteToken,
  hashInviteToken,
} from "@/modules/users/utils/invite-token"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"
import {
  assertAssignableRoleKey,
  assertCanManageMember,
  isAssignableRoleKey,
} from "@/modules/users/utils/member-rules"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

describe("users invite token", () => {
  it("hashes tokens deterministically and never equals the raw token", () => {
    const token = createInviteToken()
    const hash = hashInviteToken(token)
    expect(hash).toBe(hashInviteToken(token))
    expect(hash).not.toBe(token)
    expect(hash.length).toBe(64)
  })
})

describe("users member rules", () => {
  it("accepts assignable role keys", () => {
    for (const key of ASSIGNABLE_ROLE_KEYS) {
      expect(isAssignableRoleKey(key)).toBe(true)
      expect(assertAssignableRoleKey(key)).toBe(key)
    }
  })

  it("rejects owner as assignable", () => {
    expect(isAssignableRoleKey("owner")).toBe(false)
    try {
      assertAssignableRoleKey("owner")
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.FORBIDDEN)(error),
      ).toBe(true)
    }
  })

  it("blocks managing owner or self", () => {
    try {
      assertCanManageMember({
                actorUserId: "a",
                targetUserId: "b",
                targetRoleKey: "owner",
              })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.FORBIDDEN)(error),
      ).toBe(true)
    }

    try {
      assertCanManageMember({
                actorUserId: "a",
                targetUserId: "a",
                targetRoleKey: "admin",
              })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.FORBIDDEN)(error),
      ).toBe(true)
    }
  })

  it("allows managing another non-owner member", () => {
    expect(() => assertCanManageMember({
              actorUserId: "a",
              targetUserId: "b",
              targetRoleKey: "clinician",
            })).not.toThrow()
  })
})

describe("users schemas", () => {
  it("normalizes invite email", () => {
    const parsed = inviteMemberSchema.parse({
      name: " Ana ",
      email: "Ana@Clinic.COM",
      roleKey: "receptionist",
    })
    expect(parsed.email).toBe("ana@clinic.com")
    expect(parsed.name).toBe("Ana")
  })

  it("rejects owner on invite schema", () => {
    const result = inviteMemberSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      roleKey: "owner",
    })
    expect(result.success).toBe(false)
  })

  it("requires matching passwords on set-password-from-invite", () => {
    const ok = setPasswordFromInviteSchema.safeParse({
      token: "abc",
      newPassword: "senha-forte",
      confirmPassword: "senha-forte",
    })
    expect(ok.success).toBe(true)

    const mismatch = setPasswordFromInviteSchema.safeParse({
      token: "abc",
      newPassword: "senha-forte",
      confirmPassword: "outra-senha",
    })
    expect(mismatch.success).toBe(false)
  })

  it("requires membership id uuid for role update", () => {
    const result = updateMemberRoleSchema.safeParse({
      membershipId: "bad",
      roleKey: "admin",
    })
    expect(result.success).toBe(false)
  })
})

describe("role labels", () => {
  it("returns portuguese labels for known roles", () => {
    expect(getRoleLabel("clinician")).toBe("Profissional de saúde")
    expect(getRoleLabel("custom", "Custom")).toBe("Custom")
  })
})

describe("listMembersSchema", () => {
  it("defaults page and pageSize", () => {
    const parsed = listMembersSchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(DEFAULT_LIST_PAGE_SIZE)
    expect(parsed.q).toBe(undefined)
  })
})
