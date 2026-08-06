import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
    assert.equal(hash, hashInviteToken(token))
    assert.notEqual(hash, token)
    assert.equal(hash.length, 64)
  })
})

describe("users member rules", () => {
  it("accepts assignable role keys", () => {
    for (const key of ASSIGNABLE_ROLE_KEYS) {
      assert.equal(isAssignableRoleKey(key), true)
      assert.equal(assertAssignableRoleKey(key), key)
    }
  })

  it("rejects owner as assignable", () => {
    assert.equal(isAssignableRoleKey("owner"), false)
    assert.throws(
      () => assertAssignableRoleKey("owner"),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.FORBIDDEN,
    )
  })

  it("blocks managing owner or self", () => {
    assert.throws(
      () =>
        assertCanManageMember({
          actorUserId: "a",
          targetUserId: "b",
          targetRoleKey: "owner",
        }),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.FORBIDDEN,
    )

    assert.throws(
      () =>
        assertCanManageMember({
          actorUserId: "a",
          targetUserId: "a",
          targetRoleKey: "admin",
        }),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.FORBIDDEN,
    )
  })

  it("allows managing another non-owner member", () => {
    assert.doesNotThrow(() =>
      assertCanManageMember({
        actorUserId: "a",
        targetUserId: "b",
        targetRoleKey: "clinician",
      }),
    )
  })
})

describe("users schemas", () => {
  it("normalizes invite email", () => {
    const parsed = inviteMemberSchema.parse({
      name: " Ana ",
      email: "Ana@Clinic.COM",
      roleKey: "receptionist",
    })
    assert.equal(parsed.email, "ana@clinic.com")
    assert.equal(parsed.name, "Ana")
  })

  it("rejects owner on invite schema", () => {
    const result = inviteMemberSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      roleKey: "owner",
    })
    assert.equal(result.success, false)
  })

  it("requires matching passwords on set-password-from-invite", () => {
    const ok = setPasswordFromInviteSchema.safeParse({
      token: "abc",
      newPassword: "senha-forte",
      confirmPassword: "senha-forte",
    })
    assert.equal(ok.success, true)

    const mismatch = setPasswordFromInviteSchema.safeParse({
      token: "abc",
      newPassword: "senha-forte",
      confirmPassword: "outra-senha",
    })
    assert.equal(mismatch.success, false)
  })

  it("requires membership id uuid for role update", () => {
    const result = updateMemberRoleSchema.safeParse({
      membershipId: "bad",
      roleKey: "admin",
    })
    assert.equal(result.success, false)
  })
})

describe("role labels", () => {
  it("returns portuguese labels for known roles", () => {
    assert.equal(getRoleLabel("clinician"), "Profissional de saúde")
    assert.equal(getRoleLabel("custom", "Custom"), "Custom")
  })
})

describe("listMembersSchema", () => {
  it("defaults page and pageSize", () => {
    const parsed = listMembersSchema.parse({})
    assert.equal(parsed.page, 1)
    assert.equal(parsed.pageSize, DEFAULT_LIST_PAGE_SIZE)
    assert.equal(parsed.q, undefined)
  })
})
