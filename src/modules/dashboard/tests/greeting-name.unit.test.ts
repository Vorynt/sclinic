import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getGreetingFirstName } from "@/modules/dashboard/utils/greeting-name"

describe("getGreetingFirstName", () => {
  it("returns the first given name", () => {
    assert.equal(getGreetingFirstName("Ana Beatriz"), "Ana")
  })

  it("skips treatment pronouns", () => {
    assert.equal(getGreetingFirstName("Dr. Carlos Eduardo"), "Carlos")
    assert.equal(getGreetingFirstName("Dra. Ana Beatriz"), "Ana")
    assert.equal(getGreetingFirstName("Enf. Marina"), "Marina")
  })

  it("is case-insensitive for pronouns", () => {
    assert.equal(getGreetingFirstName("DR. João"), "João")
    assert.equal(getGreetingFirstName("dra Ana"), "Ana")
  })

  it("falls back when name is empty or only a pronoun", () => {
    assert.equal(getGreetingFirstName(""), "olá")
    assert.equal(getGreetingFirstName(null), "olá")
    assert.equal(getGreetingFirstName("Dr."), "olá")
    assert.equal(getGreetingFirstName("   "), "olá")
  })
})
