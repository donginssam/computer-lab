import { describe, expect, it } from "vitest"
import { simulatorPath, unitById, units } from "./units"

describe("units", () => {
  it("교과서 5개 단원을 순서대로 가진다", () => {
    expect(units.map(u => u.order)).toEqual([1, 2, 3, 4, 5])
    expect(new Set(units.map(u => u.id)).size).toBe(5)
  })

  it("시뮬레이터 slug는 단원 안에서 유일하다", () => {
    for (const u of units) {
      const slugs = u.simulators.map(s => s.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })

  it("가짜 동전 찾기 시뮬레이터 경로를 만든다", () => {
    const algo = unitById("algorithm")!
    expect(simulatorPath(algo, algo.simulators[0])).toBe("/units/algorithm/balance-scale")
  })
})
