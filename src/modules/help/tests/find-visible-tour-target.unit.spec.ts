/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals"

import { findVisibleTourTarget } from "@/modules/help/utils/find-visible-tour-target"

describe("findVisibleTourTarget", () => {
  it("returns the first visible matching element", () => {
    document.body.innerHTML = `
      <button data-tour="nav-home" style="display:none">hidden</button>
      <a data-tour="nav-home">visible</a>
    `
    const found = findVisibleTourTarget("nav-home")
    expect(found?.textContent).toBe("visible")
  })

  it("returns null when every match is hidden", () => {
    document.body.innerHTML = `<span data-tour="nav-home" hidden>x</span>`
    expect(findVisibleTourTarget("nav-home")).toBeNull()
  })
})
