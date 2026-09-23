import { expect, it } from "vitest"
import { clampedParam, clampInteger } from "./params"

it("값이 없거나 숫자가 아니면 기본값을, 숫자면 범위에 맞춘 정수를 돌려준다", () => {
  const clamp = (value: number) => clampInteger(value, 2, 16)
  const cases = [
    [null, 8],
    [undefined, 8],
    ["", 8],
    ["  ", 8],
    ["abc", 8],
    ["0", 2],
    ["7.9", 7],
    ["99", 16],
  ] as const
  for (const [input, expected] of cases) expect(clampedParam(input, 8, clamp)).toBe(expected)
})
