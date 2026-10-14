import { expect, it } from "vitest"
import { placeValues } from "./digits"

it("자릿값은 큰 자리부터 2배씩 줄어들고 지정한 비트 수를 따른다", () => {
  expect(placeValues()).toEqual([128, 64, 32, 16, 8, 4, 2, 1])
  expect(placeValues(4)).toEqual([8, 4, 2, 1])
})
