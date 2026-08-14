import { describe, expect, it } from "@jest/globals"

import { Permission, type PermissionKey } from "@/config/permissions"
import { routes } from "@/config/routes"
import {
  canAccessPath,
  getVisibleShellNav,
  hasOverflowNav,
  isNavActive,
} from "@/modules/dashboard/constants/nav"

describe("canAccessPath", () => {
  it("allows home for any granted set", () => {
    expect(canAccessPath(routes.home, [])).toBe(true)
  })

  it("allows path when role has required permission", () => {
    expect(canAccessPath(routes.patients, [Permission.PATIENTS_READ])).toBe(true)
  })

  it("denies path when role lacks required permission", () => {
    expect(canAccessPath(routes.professionals, [Permission.PATIENTS_READ])).toBe(false)
  })

  it("matches nested paths against the parent nav item", () => {
    expect(canAccessPath(`${routes.users}/invite`, [Permission.MEMBERS_INVITE])).toBe(true)
    expect(canAccessPath(`${routes.users}/invite`, [])).toBe(false)
  })

  it("allows unknown paths (no nav permission gate)", () => {
    expect(canAccessPath("/unknown-page", [])).toBe(true)
  })
})

describe("getVisibleShellNav", () => {
  function makeCanAny(granted: PermissionKey[]) {
    const set = new Set(granted)
    return (...permissions: PermissionKey[]) =>
      permissions.some((p) => set.has(p))
  }

  it("keeps primary order Início → Agenda → Pacientes", () => {
    const nav = getVisibleShellNav(
      makeCanAny([
        Permission.APPOINTMENTS_CREATE,
        Permission.PATIENTS_READ,
        Permission.PROFESSIONALS_MANAGE,
      ]),
    )
    expect(nav.primary.map((item) => item.href)).toEqual([routes.home, routes.appointments, routes.patients])
  })

  it("puts management modules in overflow groups", () => {
    const nav = getVisibleShellNav(
      makeCanAny([
        Permission.PROFESSIONALS_MANAGE,
        Permission.MEMBERS_INVITE,
        Permission.FINANCIAL_VIEW,
      ]),
    )
    const overflowHrefs = nav.groups.flatMap((g) =>
      g.items.map((item) => item.href),
    )
    expect(overflowHrefs).toEqual([
      routes.professionals,
      routes.users,
      routes.billing,
    ])
  })

  it("hides overflow items without permission", () => {
    const nav = getVisibleShellNav(makeCanAny([Permission.PATIENTS_READ]))
    expect(nav.primary.some((i) => i.href === routes.patients)).toBe(true)
    expect(nav.groups.length).toBe(0)
    expect(hasOverflowNav(nav)).toBe(true) // Ajuda has no permission gate
  })

  it("marks Ajuda as always visible in secondary", () => {
    const nav = getVisibleShellNav(() => false)
    expect(nav.secondary.some((item) => item.href === routes.help)).toBe(true)
  })
})

describe("isNavActive", () => {
  it("matches home only exactly", () => {
    expect(isNavActive(routes.home, routes.home)).toBe(true)
    expect(isNavActive(`${routes.home}/extra`, routes.home)).toBe(false)
  })

  it("matches nested paths for other modules", () => {
    expect(isNavActive(`${routes.patients}/abc`, routes.patients)).toBe(true)
  })
})
