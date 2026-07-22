import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
  switchClinicSchema,
} from "@/modules/authentication/schemas/auth.schema"
import {
  toPermissionKeys,
  toUserStatus,
} from "@/modules/authentication/mappers/auth.mapper"
import { assertUserCanAuthenticate } from "@/modules/authentication/utils/assert-user"
import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"
import { parseForm } from "@/shared/validators"
import { hasAllPermissions, hasAnyPermission } from "@/core/permissions"
import { Permission } from "@/config/permissions"

describe("auth schemas", () => {
  it("accepts valid sign-up payload and normalizes email", () => {
    const parsed = signUpSchema.parse({
      name: "Ana",
      email: "Ana@Clinic.COM",
      password: "senha-forte",
    })
    assert.equal(parsed.email, "ana@clinic.com")
  })

  it("rejects short passwords on sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      password: "curta",
    })
    assert.equal(result.success, false)
  })

  it("requires password on sign-in", () => {
    const result = signInSchema.safeParse({
      email: "ana@clinic.com",
      password: "",
    })
    assert.equal(result.success, false)
  })

  it("requires uuid clinic id", () => {
    const result = switchClinicSchema.safeParse({ clinicId: "not-a-uuid" })
    assert.equal(result.success, false)
  })

  it("accepts change password payload", () => {
    const parsed = changePasswordSchema.parse({
      currentPassword: "antiga-senha",
      newPassword: "nova-senha-ok",
    })
    assert.equal(parsed.newPassword, "nova-senha-ok")
  })

  it("parseForm returns first field error for invalid sign-in", () => {
    const result = parseForm(signInSchema, {
      email: "",
      password: "",
    })
    assert.equal(result.success, false)
    if (!result.success) {
      assert.equal(typeof result.fieldErrors.email, "string")
      assert.equal(typeof result.fieldErrors.password, "string")
    }
  })

  it("parseForm returns normalized data for valid sign-up", () => {
    const result = parseForm(signUpSchema, {
      name: " Ana ",
      email: "Ana@Clinic.COM",
      password: "senha-forte",
    })
    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.data.name, "Ana")
      assert.equal(result.data.email, "ana@clinic.com")
    }
  })
})

describe("auth mappers", () => {
  it("maps known user statuses", () => {
    assert.equal(toUserStatus("suspended"), "suspended")
    assert.equal(toUserStatus("weird"), "active")
  })

  it("filters unknown permission keys", () => {
    const keys = toPermissionKeys([
      Permission.PATIENTS_READ,
      "patients.hack",
      Permission.SETTINGS_MANAGE,
    ])
    assert.deepEqual(keys, [
      Permission.PATIENTS_READ,
      Permission.SETTINGS_MANAGE,
    ])
  })
})

describe("assertUserCanAuthenticate", () => {
  const base = {
    id: "1",
    name: "Ana",
    email: "ana@clinic.com",
    emailVerified: true,
    image: null,
    phone: null,
  }

  it("allows active users", () => {
    assert.doesNotThrow(() =>
      assertUserCanAuthenticate({ ...base, status: "active" }),
    )
  })

  it("blocks suspended users", () => {
    assert.throws(
      () => assertUserCanAuthenticate({ ...base, status: "suspended" }),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.USER_SUSPENDED,
    )
  })

  it("blocks inactive users", () => {
    assert.throws(
      () => assertUserCanAuthenticate({ ...base, status: "inactive" }),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.USER_INACTIVE,
    )
  })
})

describe("permission checks", () => {
  it("requires all permissions", () => {
    assert.equal(
      hasAllPermissions(
        [Permission.PATIENTS_READ, Permission.PATIENTS_WRITE],
        [Permission.PATIENTS_READ],
      ),
      true,
    )
    assert.equal(
      hasAllPermissions(
        [Permission.PATIENTS_READ],
        [Permission.PATIENTS_READ, Permission.PATIENTS_WRITE],
      ),
      false,
    )
  })

  it("requires any permission", () => {
    assert.equal(
      hasAnyPermission(
        [Permission.FINANCIAL_VIEW],
        [Permission.FINANCIAL_VIEW, Permission.FINANCIAL_MANAGE],
      ),
      true,
    )
    assert.equal(
      hasAnyPermission(
        [Permission.PATIENTS_READ],
        [Permission.FINANCIAL_VIEW],
      ),
      false,
    )
  })
})
