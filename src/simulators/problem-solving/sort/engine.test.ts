import { describe, expect, it } from "vitest"
import {
  createSortTrace,
  mergeSortComparisonLimit,
  parseCardInput,
  sortEngine,
  worstCaseOrder,
} from "./engine"

function permutations(values: number[]): number[][] {
  if (values.length <= 1) return [values]
  return values.flatMap((value, index) =>
    permutations([...values.slice(0, index), ...values.slice(index + 1)]).map(rest => [
      value,
      ...rest,
    ]),
  )
}

function finish(cards: number[]) {
  let state = sortEngine.init({ n: cards.length, order: "manual", cards }, 0)
  while (!state.finished) state = sortEngine.step(state)
  return state
}

describe("합병 정렬 엔진", () => {
  it("N≤7 모든 순열을 정렬하고 비교 상한을 넘지 않는다", () => {
    for (let n = 2; n <= 7; n += 1) {
      const expected = Array.from({ length: n }, (_, index) => index + 1)
      for (const cards of permutations(expected)) {
        const state = finish(cards)
        const last = state.trace.at(-1)
        expect(last?.kind).toBe("merged")
        if (last?.kind === "merged") expect(last.values).toEqual(expected)
        expect(state.comparisons).toBeLessThanOrEqual(mergeSortComparisonLimit(n))
      }
    }
  })

  it("가장 많이 비교하는 순서가 2~16에서 상한에 닿는다", () => {
    for (let n = 2; n <= 16; n += 1) {
      expect(finish(worstCaseOrder(n)).comparisons).toBe(mergeSortComparisonLimit(n))
    }
    expect(worstCaseOrder(8)).toEqual([8, 4, 6, 2, 7, 3, 5, 1])
    expect(finish(worstCaseOrder(16)).comparisons).toBe(49)
  })

  it("8장 거꾸로 순서는 12회로 상한보다 적다", () => {
    const state = finish([8, 7, 6, 5, 4, 3, 2, 1])
    expect(state.comparisons).toBe(12)
    expect(state.comparisons).toBeLessThan(mergeSortComparisonLimit(8))
  })

  it("trace를 앞뒤로 이동해도 비교 횟수가 일관된다", () => {
    let state = sortEngine.init({ n: 4, order: "manual", cards: [4, 2, 3, 1] }, 0)
    const length = state.trace.length
    while (!state.finished) state = sortEngine.step(state)
    const comparisons = state.comparisons
    for (let index = 0; index < length; index += 1) state = sortEngine.back!(state)
    expect(state).toMatchObject({ index: 0, comparisons: 0, finished: false })
    while (!state.finished) state = sortEngine.step(state)
    expect(state.comparisons).toBe(comparisons)
    expect(state.trace).toHaveLength(length)
  })

  it("직접 입력의 개수·중복·범위를 검증한다", () => {
    expect(parseCardInput("35-12-90-7", 4)).toEqual([35, 12, 90, 7])
    expect(() => parseCardInput("1-1", 2)).toThrow()
    expect(() => parseCardInput("1-100", 2)).toThrow()
    expect(() => parseCardInput("1-2", 3)).toThrow()
    expect(createSortTrace([2, 1]).sorted).toEqual([1, 2])
  })
})
