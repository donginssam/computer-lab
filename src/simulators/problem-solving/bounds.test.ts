import { expect, it } from "vitest"
import { AMOUNT_MAX, AMOUNT_MIN, isAmountInRange, randomAmount } from "./bounds"

it("무작위 금액은 범위 안의 단위 금액이고 양 끝도 나올 수 있다", () => {
  expect(randomAmount(() => 0)).toBe(AMOUNT_MIN)
  expect(randomAmount(() => 0.999999)).toBe(AMOUNT_MAX)
  for (let index = 0; index < 200; index += 1) expect(isAmountInRange(randomAmount())).toBe(true)
})
