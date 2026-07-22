import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  ASSIGNABLE_ROLE_KEYS,
  getRoleLabel,
} from "@/modules/users/constants/users"
import { inviteMemberSchema } from "@/modules/users/schemas/invitation.schema"
import { updateMemberRoleSchema } from "@/modules/users/schemas/member.schema"
import {
  createInviteToken,
  hashInviteToken,
} from "@/modules/users/utils/invite-token"
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
        targetRoleKey: "doctor",
      }),
    )
  })
})

describe("users schemas", () => {
  it("normalizes invite email and keeps provisional password", () => {
    const parsed = inviteMemberSchema.parse({
      name: " Ana ",
      email: "Ana@Clinic.COM",
      temporaryPassword: "senha-forte",
      roleKey: "doctor",
    })
    assert.equal(parsed.email, "ana@clinic.com")
    assert.equal(parsed.name, "Ana")
    assert.equal(parsed.temporaryPassword, "senha-forte")
  })

  it("rejects owner on invite schema", () => {
    const result = inviteMemberSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      temporaryPassword: "senha-forte",
      roleKey: "owner",
    })
    assert.equal(result.success, false)
  })

  it("rejects short provisional password", () => {
    const result = inviteMemberSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      temporaryPassword: "curta",
      roleKey: "admin",
    })
    assert.equal(result.success, false)
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
    assert.equal(getRoleLabel("doctor"), "Médico(a)")
    assert.equal(getRoleLabel("custom", "Custom"), "Custom")
  })
})
