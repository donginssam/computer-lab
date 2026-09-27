import { describe, expect, it } from "vitest"
import { bitString, divisionRows, fromBits, placeValues, readRemainders, toBits } from "./engine"

describe("양의 정수와 이진수", () => {
  it("자릿값은 큰 자리부터 2배씩 줄어든다", () => {
    expect(placeValues()).toEqual([128, 64, 32, 16, 8, 4, 2, 1])
  })

  it("0~255 전체를 8비트로 바꿨다가 그대로 되돌린다", () => {
    for (let n = 0; n <= 255; n += 1) {
      const result = toBits(n)
      expect(result).toHaveLength(8)
      expect(fromBits(result)).toBe(n)
      expect(bitString(result)).toBe(n.toString(2).padStart(8, "0"))
    }
  })

  it("8비트 밖의 수와 정수가 아닌 수는 거부한다", () => {
    expect(() => toBits(256)).toThrow()
    expect(() => toBits(-1)).toThrow()
    expect(() => toBits(2.5)).toThrow()
  })
})

describe("2로 나누기", () => {
  it("13은 나머지 1·0·1·1을 아래에서 위로 읽어 1101이 된다", () => {
    const rows = divisionRows(13)
    expect(rows).toEqual([
      { dividend: 13, quotient: 6, remainder: 1 },
      { dividend: 6, quotient: 3, remainder: 0 },
      { dividend: 3, quotient: 1, remainder: 1 },
      { dividend: 1, quotient: 0, remainder: 1 },
    ])
    expect(readRemainders(rows)).toBe("1101")
  })

  it("1~255에서 자릿값 카드와 같은 답을 낸다", () => {
    for (let n = 1; n <= 255; n += 1) {
      expect(readRemainders(divisionRows(n))).toBe(n.toString(2))
      expect(divisionRows(n)).toHaveLength(n.toString(2).length)
    }
  })

  it("0은 나눌 필요가 없어 0으로 읽는다", () => {
    expect(divisionRows(0)).toEqual([])
    expect(readRemainders([])).toBe("0")
  })
})
