import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculatePlatformFee,
  fromMinorUnits,
  toMinorUnits,
} from "../lib/wallet/money"

describe("wallet money utilities", () => {
  it("converts XAF amounts as whole minor units", () => {
    assert.equal(toMinorUnits("1500", "XAF"), 1500)
    assert.equal(fromMinorUnits(1500, "XAF"), "1500")
  })

  it("converts USD amounts to cents", () => {
    assert.equal(toMinorUnits("15.50", "USD"), 1550)
    assert.equal(fromMinorUnits(1550, "USD"), "15.50")
  })

  it("calculates platform fee with rounding", () => {
    assert.equal(calculatePlatformFee(10000, 5), 500)
    assert.equal(calculatePlatformFee(1001, 5), 50)
    assert.equal(calculatePlatformFee(1000, 0), 0)
  })
})

describe("settlement idempotency contract", () => {
  it("net credit equals gross minus fee", () => {
    const grossMinor = toMinorUnits("2000", "XAF")
    const feePercent = 5
    const feeMinor = calculatePlatformFee(grossMinor, feePercent)
    const netMinor = grossMinor - feeMinor

    assert.equal(netMinor, 1900)
    assert.equal(feeMinor + netMinor, grossMinor)
  })
})
