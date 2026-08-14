import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  changePasswordSchema,
  revokeSessionSchema,
  signInSchema,
  signUpSchema,
  switchClinicSchema,
  verifyBackupCodeSchema,
  verifyTotpSchema,
} from "@/modules/authentication/schemas/auth.schema"
import {
  toPermissionKeys,
  toUserStatus,
} from "@/modules/authentication/mappers/auth.mapper"
import { assertUserCanAuthenticate } from "@/modules/authentication/utils/assert-user"
import {
  getPostAuthRedirect,
  getSafeNextPath,
  getTwoFactorPath,
} from "@/modules/authentication/utils/post-auth-redirect"
import {
  isAuthEntryPath,
  isPublicPath,
} from "@/modules/authentication/utils/route-access"
import { sessionDeviceLabel } from "@/modules/authentication/utils/session-device-label"
import { assertCanRevokeSession } from "@/modules/authentication/utils/session-rules"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { routes } from "@/config/routes"
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
      acceptTerms: true,
    })
    assert.equal(parsed.email, "ana@clinic.com")
    assert.equal(parsed.acceptTerms, true)
  })

  it("rejects short passwords on sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      password: "curta",
      acceptTerms: true,
    })
    assert.equal(result.success, false)
  })

  it("requires acceptTerms on sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      password: "senha-forte",
      acceptTerms: false,
    })
    assert.equal(result.success, false)
  })

  it("defaults rememberMe to true", () => {
    const parsed = signInSchema.parse({
      email: "ana@clinic.com",
      password: "senha-ok",
    })
    assert.equal(parsed.rememberMe, true)
  })

  it("accepts rememberMe false", () => {
    const parsed = signInSchema.parse({
      email: "ana@clinic.com",
      password: "senha-ok",
      rememberMe: false,
    })
    assert.equal(parsed.rememberMe, false)
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
      confirmPassword: "nova-senha-ok",
    })
    assert.equal(parsed.newPassword, "nova-senha-ok")
    assert.equal(parsed.revokeOtherSessions, false)
  })

  it("accepts revokeOtherSessions on change password", () => {
    const parsed = changePasswordSchema.parse({
      currentPassword: "antiga-senha",
      newPassword: "nova-senha-ok",
      confirmPassword: "nova-senha-ok",
      revokeOtherSessions: true,
    })
    assert.equal(parsed.revokeOtherSessions, true)
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
      acceptTerms: true,
    })
    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.data.name, "Ana")
      assert.equal(result.data.email, "ana@clinic.com")
      assert.equal(result.data.acceptTerms, true)
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
    mustChangePassword: false,
    twoFactorEnabled: false,
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

describe("getPostAuthRedirect", () => {
  const baseAuth: AuthContext = {
    user: {
      id: "1",
      name: "Ana",
      email: "ana@clinic.com",
      emailVerified: true,
      image: null,
      phone: null,
      status: "active",
      mustChangePassword: false,
      twoFactorEnabled: false,
    },
    session: {
      id: "s1",
      userId: "1",
      token: "tok",
      expiresAt: new Date("2099-01-01"),
      activeClinicId: null,
    },
    membership: null,
    permissions: [],
    hasSuspendedMembershipOnly: false,
    needsClinicSelection: false,
    subscriptionBlockedClinic: null,
  }

  it("sends unverified users to verify-email", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        user: { ...baseAuth.user, emailVerified: false },
      }),
      routes.verifyEmail,
    )
  })

  it("honors invite next for unverified users", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, emailVerified: false },
        },
        `${routes.invite}?token=abc`,
      ),
      `${routes.invite}?token=abc`,
    )
  })

  it("honors professional invite next for unverified users", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, emailVerified: false },
        },
        `${routes.professionalInvite}?token=abc`,
      ),
      `${routes.professionalInvite}?token=abc`,
    )
  })

  it("sends users with provisional password to change-password", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        user: { ...baseAuth.user, mustChangePassword: true },
      }),
      routes.changePassword,
    )
  })

  it("preserves invite next when password change is required", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, mustChangePassword: true },
        },
        `${routes.invite}?token=abc`,
      ),
      `${routes.changePassword}?next=${encodeURIComponent(`${routes.invite}?token=abc`)}`,
    )
  })

  it("sends verified users without membership to onboarding", () => {
    assert.equal(getPostAuthRedirect(baseAuth), routes.onboardingPlan)
  })

  it("sends users with only suspended memberships to membership-inactive", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        hasSuspendedMembershipOnly: true,
      }),
      routes.membershipInactive,
    )
  })

  it("sends users who need clinic selection to select-clinic", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        needsClinicSelection: true,
      }),
      routes.selectClinic,
    )
  })

  it("sends users blocked by clinic subscription to select-clinic", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        needsClinicSelection: true,
        subscriptionBlockedClinic: {
          clinicId: "c1",
          clinicName: "Clínica Demo",
          isOwner: true,
        },
      }),
      routes.selectClinic,
    )
  })

  it("preserves next when redirecting to select-clinic", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          needsClinicSelection: true,
        },
        routes.patients,
      ),
      `${routes.selectClinic}?next=${encodeURIComponent(routes.patients)}`,
    )
  })

  it("honors invite next even without membership", () => {
    assert.equal(
      getPostAuthRedirect(baseAuth, `${routes.invite}?token=abc`),
      `${routes.invite}?token=abc`,
    )
  })

  it("ignores unsafe next paths", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          membership: {
            id: "m1",
            clinicId: "c1",
            roleId: "r1",
            roleKey: "owner",
            roleName: "Owner",
            status: "active",
            isDefault: true,
          },
        },
        "https://evil.example",
      ),
      routes.home,
    )
  })

  it("ignores auth-entry next and sends members home", () => {
    assert.equal(
      getPostAuthRedirect(
        {
          ...baseAuth,
          membership: {
            id: "m1",
            clinicId: "c1",
            roleId: "r1",
            roleKey: "owner",
            roleName: "Owner",
            status: "active",
            isDefault: true,
          },
        },
        routes.login,
      ),
      routes.home,
    )
  })

  it("sends verified users with membership to home", () => {
    assert.equal(
      getPostAuthRedirect({
        ...baseAuth,
        membership: {
          id: "m1",
          clinicId: "c1",
          roleId: "r1",
          roleKey: "owner",
          roleName: "Owner",
          status: "active",
          isDefault: true,
        },
        session: { ...baseAuth.session, activeClinicId: "c1" },
      }),
      routes.home,
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

describe("two-factor schemas", () => {
  it("accepts a 6-digit TOTP code", () => {
    const parsed = verifyTotpSchema.parse({ code: "123456" })
    assert.equal(parsed.code, "123456")
  })

  it("rejects a short TOTP code", () => {
    assert.equal(verifyTotpSchema.safeParse({ code: "123" }).success, false)
  })

  it("accepts a backup code", () => {
    const parsed = verifyBackupCodeSchema.parse({ code: "abcd1234ef" })
    assert.equal(parsed.code, "abcd1234ef")
  })
})

describe("session rules", () => {
  it("rejects revoking the current session", () => {
    assert.throws(
      () => assertCanRevokeSession("s1", "s1"),
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ErrorCode.CANNOT_REVOKE_CURRENT_SESSION,
    )
  })

  it("allows revoking another session", () => {
    assert.doesNotThrow(() => assertCanRevokeSession("s1", "s2"))
  })

  it("requires a session id", () => {
    assert.equal(revokeSessionSchema.safeParse({ sessionId: "" }).success, false)
  })
})

describe("sessionDeviceLabel", () => {
  it("labels chrome on macOS", () => {
    assert.equal(
      sessionDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
      "Chrome · macOS",
    )
  })

  it("falls back when UA is missing", () => {
    assert.equal(sessionDeviceLabel(null), "Dispositivo desconhecido")
  })
})

describe("getTwoFactorPath", () => {
  it("preserves a safe next path", () => {
    assert.equal(
      getTwoFactorPath("/home"),
      `${routes.twoFactor}?next=%2Fhome`,
    )
  })

  it("drops auth-entry next paths", () => {
    assert.equal(getTwoFactorPath(routes.login), routes.twoFactor)
  })
})

describe("getSafeNextPath", () => {
  it("rejects protocol-relative and absolute URLs", () => {
    assert.equal(getSafeNextPath("//evil.example"), null)
    assert.equal(getSafeNextPath("https://evil.example"), null)
  })

  it("rejects auth entry paths including query strings", () => {
    assert.equal(getSafeNextPath(routes.login), null)
    assert.equal(getSafeNextPath(`${routes.login}?next=/home`), null)
    assert.equal(getSafeNextPath(routes.twoFactor), null)
    assert.equal(getSafeNextPath(routes.resetPassword), null)
  })

  it("keeps in-app destinations", () => {
    assert.equal(getSafeNextPath(routes.home), routes.home)
    assert.equal(
      getSafeNextPath(`${routes.invite}?token=abc`),
      `${routes.invite}?token=abc`,
    )
  })
})

describe("route access", () => {
  it("treats auth entry paths as public guest routes", () => {
    assert.equal(isAuthEntryPath(routes.login), true)
    assert.equal(isAuthEntryPath(routes.signUp), true)
    assert.equal(isAuthEntryPath(routes.forgotPassword), true)
    assert.equal(isAuthEntryPath(routes.twoFactor), true)
    assert.equal(isAuthEntryPath(routes.resetPassword), true)
    assert.equal(isAuthEntryPath(`${routes.resetPassword}/token`), true)
    assert.equal(isPublicPath(routes.login), true)
    assert.equal(isPublicPath(routes.twoFactor), true)
  })

  it("treats marketing, legal, invite and auth APIs as public", () => {
    assert.equal(isPublicPath(routes.landing), true)
    assert.equal(isPublicPath(routes.legal), true)
    assert.equal(isPublicPath(routes.terms), true)
    assert.equal(isPublicPath(routes.invite), true)
    assert.equal(isPublicPath(routes.professionalInvite), true)
    assert.equal(isPublicPath("/api/auth"), true)
    assert.equal(isPublicPath("/api/stripe/webhook"), true)
  })

  it("does not treat app or session-gated auth paths as public or auth-entry", () => {
    assert.equal(isAuthEntryPath(routes.home), false)
    assert.equal(isAuthEntryPath(routes.verifyEmail), false)
    assert.equal(isPublicPath(routes.home), false)
    assert.equal(isPublicPath(routes.patients), false)
    assert.equal(isPublicPath(routes.verifyEmail), false)
    assert.equal(isPublicPath(routes.changePassword), false)
    assert.equal(isPublicPath(routes.onboardingPlan), false)
  })
})
