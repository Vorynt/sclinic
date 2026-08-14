import { describe, expect, it } from "@jest/globals"

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
    expect(parsed.email).toBe("ana@clinic.com")
    expect(parsed.acceptTerms).toBe(true)
  })

  it("rejects short passwords on sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      password: "curta",
      acceptTerms: true,
    })
    expect(result.success).toBe(false)
  })

  it("requires acceptTerms on sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Ana",
      email: "ana@clinic.com",
      password: "senha-forte",
      acceptTerms: false,
    })
    expect(result.success).toBe(false)
  })

  it("defaults rememberMe to true", () => {
    const parsed = signInSchema.parse({
      email: "ana@clinic.com",
      password: "senha-ok",
    })
    expect(parsed.rememberMe).toBe(true)
  })

  it("accepts rememberMe false", () => {
    const parsed = signInSchema.parse({
      email: "ana@clinic.com",
      password: "senha-ok",
      rememberMe: false,
    })
    expect(parsed.rememberMe).toBe(false)
  })

  it("requires password on sign-in", () => {
    const result = signInSchema.safeParse({
      email: "ana@clinic.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })

  it("requires uuid clinic id", () => {
    const result = switchClinicSchema.safeParse({ clinicId: "not-a-uuid" })
    expect(result.success).toBe(false)
  })

  it("accepts change password payload", () => {
    const parsed = changePasswordSchema.parse({
      currentPassword: "antiga-senha",
      newPassword: "nova-senha-ok",
      confirmPassword: "nova-senha-ok",
    })
    expect(parsed.newPassword).toBe("nova-senha-ok")
    expect(parsed.revokeOtherSessions).toBe(false)
  })

  it("accepts revokeOtherSessions on change password", () => {
    const parsed = changePasswordSchema.parse({
      currentPassword: "antiga-senha",
      newPassword: "nova-senha-ok",
      confirmPassword: "nova-senha-ok",
      revokeOtherSessions: true,
    })
    expect(parsed.revokeOtherSessions).toBe(true)
  })

  it("parseForm returns first field error for invalid sign-in", () => {
    const result = parseForm(signInSchema, {
      email: "",
      password: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(typeof result.fieldErrors.email).toBe("string")
      expect(typeof result.fieldErrors.password).toBe("string")
    }
  })

  it("parseForm returns normalized data for valid sign-up", () => {
    const result = parseForm(signUpSchema, {
      name: " Ana ",
      email: "Ana@Clinic.COM",
      password: "senha-forte",
      acceptTerms: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Ana")
      expect(result.data.email).toBe("ana@clinic.com")
      expect(result.data.acceptTerms).toBe(true)
    }
  })
})

describe("auth mappers", () => {
  it("maps known user statuses", () => {
    expect(toUserStatus("suspended")).toBe("suspended")
    expect(toUserStatus("weird")).toBe("active")
  })

  it("filters unknown permission keys", () => {
    const keys = toPermissionKeys([
      Permission.PATIENTS_READ,
      "patients.hack",
      Permission.SETTINGS_MANAGE,
    ])
    expect(keys).toEqual([
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
    expect(() => assertUserCanAuthenticate({ ...base, status: "active" })).not.toThrow()
  })

  it("blocks suspended users", () => {
    try {
      assertUserCanAuthenticate({ ...base, status: "suspended" })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.USER_SUSPENDED)(error),
      ).toBe(true)
    }
  })

  it("blocks inactive users", () => {
    try {
      assertUserCanAuthenticate({ ...base, status: "inactive" })
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.USER_INACTIVE)(error),
      ).toBe(true)
    }
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
    expect(getPostAuthRedirect({
        ...baseAuth,
        user: { ...baseAuth.user, emailVerified: false },
      })).toBe(routes.verifyEmail)
  })

  it("honors invite next for unverified users", () => {
    expect(getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, emailVerified: false },
        },
        `${routes.invite}?token=abc`,
      )).toBe(`${routes.invite}?token=abc`)
  })

  it("honors professional invite next for unverified users", () => {
    expect(getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, emailVerified: false },
        },
        `${routes.professionalInvite}?token=abc`,
      )).toBe(`${routes.professionalInvite}?token=abc`)
  })

  it("sends users with provisional password to change-password", () => {
    expect(getPostAuthRedirect({
        ...baseAuth,
        user: { ...baseAuth.user, mustChangePassword: true },
      })).toBe(routes.changePassword)
  })

  it("preserves invite next when password change is required", () => {
    expect(getPostAuthRedirect(
        {
          ...baseAuth,
          user: { ...baseAuth.user, mustChangePassword: true },
        },
        `${routes.invite}?token=abc`,
      )).toBe(`${routes.changePassword}?next=${encodeURIComponent(`${routes.invite}?token=abc`)}`)
  })

  it("sends verified users without membership to onboarding", () => {
    expect(getPostAuthRedirect(baseAuth)).toBe(routes.onboardingPlan)
  })

  it("sends users with only suspended memberships to membership-inactive", () => {
    expect(getPostAuthRedirect({
        ...baseAuth,
        hasSuspendedMembershipOnly: true,
      })).toBe(routes.membershipInactive)
  })

  it("sends users who need clinic selection to select-clinic", () => {
    expect(getPostAuthRedirect({
        ...baseAuth,
        needsClinicSelection: true,
      })).toBe(routes.selectClinic)
  })

  it("sends users blocked by clinic subscription to select-clinic", () => {
    expect(getPostAuthRedirect({
        ...baseAuth,
        needsClinicSelection: true,
        subscriptionBlockedClinic: {
          clinicId: "c1",
          clinicName: "Clínica Demo",
          isOwner: true,
        },
      })).toBe(routes.selectClinic)
  })

  it("preserves next when redirecting to select-clinic", () => {
    expect(getPostAuthRedirect(
        {
          ...baseAuth,
          needsClinicSelection: true,
        },
        routes.patients,
      )).toBe(`${routes.selectClinic}?next=${encodeURIComponent(routes.patients)}`)
  })

  it("honors invite next even without membership", () => {
    expect(getPostAuthRedirect(baseAuth, `${routes.invite}?token=abc`)).toBe(`${routes.invite}?token=abc`)
  })

  it("ignores unsafe next paths", () => {
    expect(getPostAuthRedirect(
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
      )).toBe(routes.home)
  })

  it("ignores auth-entry next and sends members home", () => {
    expect(getPostAuthRedirect(
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
      )).toBe(routes.home)
  })

  it("sends verified users with membership to home", () => {
    expect(getPostAuthRedirect({
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
      })).toBe(routes.home)
  })
})

describe("permission checks", () => {
  it("requires all permissions", () => {
    expect(hasAllPermissions(
        [Permission.PATIENTS_READ, Permission.PATIENTS_WRITE],
        [Permission.PATIENTS_READ],
      )).toBe(true)
    expect(hasAllPermissions(
        [Permission.PATIENTS_READ],
        [Permission.PATIENTS_READ, Permission.PATIENTS_WRITE],
      )).toBe(false)
  })

  it("requires any permission", () => {
    expect(hasAnyPermission(
        [Permission.FINANCIAL_VIEW],
        [Permission.FINANCIAL_VIEW, Permission.FINANCIAL_MANAGE],
      )).toBe(true)
    expect(hasAnyPermission(
        [Permission.PATIENTS_READ],
        [Permission.FINANCIAL_VIEW],
      )).toBe(false)
  })
})

describe("two-factor schemas", () => {
  it("accepts a 6-digit TOTP code", () => {
    const parsed = verifyTotpSchema.parse({ code: "123456" })
    expect(parsed.code).toBe("123456")
  })

  it("rejects a short TOTP code", () => {
    expect(verifyTotpSchema.safeParse({ code: "123" }).success).toBe(false)
  })

  it("accepts a backup code", () => {
    const parsed = verifyBackupCodeSchema.parse({ code: "abcd1234ef" })
    expect(parsed.code).toBe("abcd1234ef")
  })
})

describe("session rules", () => {
  it("rejects revoking the current session", () => {
    try {
      assertCanRevokeSession("s1", "s1")
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError &&
                error.code === ErrorCode.CANNOT_REVOKE_CURRENT_SESSION)(error),
      ).toBe(true)
    }
  })

  it("allows revoking another session", () => {
    expect(() => assertCanRevokeSession("s1", "s2")).not.toThrow()
  })

  it("requires a session id", () => {
    expect(revokeSessionSchema.safeParse({ sessionId: "" }).success).toBe(false)
  })
})

describe("sessionDeviceLabel", () => {
  it("labels chrome on macOS", () => {
    expect(sessionDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      )).toBe("Chrome · macOS")
  })

  it("falls back when UA is missing", () => {
    expect(sessionDeviceLabel(null)).toBe("Dispositivo desconhecido")
  })
})

describe("getTwoFactorPath", () => {
  it("preserves a safe next path", () => {
    expect(getTwoFactorPath("/home")).toBe(`${routes.twoFactor}?next=%2Fhome`)
  })

  it("drops auth-entry next paths", () => {
    expect(getTwoFactorPath(routes.login)).toBe(routes.twoFactor)
  })
})

describe("getSafeNextPath", () => {
  it("rejects protocol-relative and absolute URLs", () => {
    expect(getSafeNextPath("//evil.example")).toBe(null)
    expect(getSafeNextPath("https://evil.example")).toBe(null)
  })

  it("rejects auth entry paths including query strings", () => {
    expect(getSafeNextPath(routes.login)).toBe(null)
    expect(getSafeNextPath(`${routes.login}?next=/home`)).toBe(null)
    expect(getSafeNextPath(routes.twoFactor)).toBe(null)
    expect(getSafeNextPath(routes.resetPassword)).toBe(null)
  })

  it("keeps in-app destinations", () => {
    expect(getSafeNextPath(routes.home)).toBe(routes.home)
    expect(getSafeNextPath(`${routes.invite}?token=abc`)).toBe(`${routes.invite}?token=abc`)
  })
})

describe("route access", () => {
  it("treats auth entry paths as public guest routes", () => {
    expect(isAuthEntryPath(routes.login)).toBe(true)
    expect(isAuthEntryPath(routes.signUp)).toBe(true)
    expect(isAuthEntryPath(routes.forgotPassword)).toBe(true)
    expect(isAuthEntryPath(routes.twoFactor)).toBe(true)
    expect(isAuthEntryPath(routes.resetPassword)).toBe(true)
    expect(isAuthEntryPath(`${routes.resetPassword}/token`)).toBe(true)
    expect(isPublicPath(routes.login)).toBe(true)
    expect(isPublicPath(routes.twoFactor)).toBe(true)
  })

  it("treats marketing, legal, invite and auth APIs as public", () => {
    expect(isPublicPath(routes.landing)).toBe(true)
    expect(isPublicPath(routes.legal)).toBe(true)
    expect(isPublicPath(routes.terms)).toBe(true)
    expect(isPublicPath(routes.invite)).toBe(true)
    expect(isPublicPath(routes.professionalInvite)).toBe(true)
    expect(isPublicPath("/api/auth")).toBe(true)
    expect(isPublicPath("/api/stripe/webhook")).toBe(true)
  })

  it("does not treat app or session-gated auth paths as public or auth-entry", () => {
    expect(isAuthEntryPath(routes.home)).toBe(false)
    expect(isAuthEntryPath(routes.verifyEmail)).toBe(false)
    expect(isPublicPath(routes.home)).toBe(false)
    expect(isPublicPath(routes.patients)).toBe(false)
    expect(isPublicPath(routes.verifyEmail)).toBe(false)
    expect(isPublicPath(routes.changePassword)).toBe(false)
    expect(isPublicPath(routes.onboardingPlan)).toBe(false)
  })
})
