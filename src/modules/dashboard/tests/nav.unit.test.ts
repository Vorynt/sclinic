import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
    assert.equal(canAccessPath(routes.home, []), true)
  })

  it("allows path when role has required permission", () => {
    assert.equal(
      canAccessPath(routes.patients, [Permission.PATIENTS_READ]),
      true,
    )
  })

  it("denies path when role lacks required permission", () => {
    assert.equal(
      canAccessPath(routes.professionals, [Permission.PATIENTS_READ]),
      false,
    )
  })

  it("matches nested paths against the parent nav item", () => {
    assert.equal(
      canAccessPath(`${routes.users}/invite`, [Permission.MEMBERS_INVITE]),
      true,
    )
    assert.equal(canAccessPath(`${routes.users}/invite`, []), false)
  })

  it("allows unknown paths (no nav permission gate)", () => {
    assert.equal(canAccessPath("/unknown-page", []), true)
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
    assert.deepEqual(
      nav.primary.map((item) => item.href),
      [routes.home, routes.appointments, routes.patients],
    )
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
    assert.deepEqual(overflowHrefs, [
      routes.professionals,
      routes.users,
      routes.billing,
    ])
  })

  it("hides overflow items without permission", () => {
    const nav = getVisibleShellNav(makeCanAny([Permission.PATIENTS_READ]))
    assert.equal(nav.primary.some((i) => i.href === routes.patients), true)
    assert.equal(nav.groups.length, 0)
    assert.equal(hasOverflowNav(nav), true) // Ajuda has no permission gate
  })

  it("marks Ajuda as always visible in secondary", () => {
    const nav = getVisibleShellNav(() => false)
    assert.equal(
      nav.secondary.some((item) => item.href === routes.help),
      true,
    )
  })
})

describe("isNavActive", () => {
  it("matches home only exactly", () => {
    assert.equal(isNavActive(routes.home, routes.home), true)
    assert.equal(isNavActive(`${routes.home}/extra`, routes.home), false)
  })

  it("matches nested paths for other modules", () => {
    assert.equal(
      isNavActive(`${routes.patients}/abc`, routes.patients),
      true,
    )
  })
})
