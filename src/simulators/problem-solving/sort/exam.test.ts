import { describe, expect, it } from "vitest"
import { examEngine, parseExamInput, divideComparisonCount } from "./exam"

describe("수행평가 시험지 정리", () => {
  it("2~30장의 번호를 보존하고 묶음별로 정리하며 모든 단계를 되감는다", () => {
    for (let n = 2; n <= 30; n++) {
      for (const order of ["random", "reverse"] as const) {
        let state = examEngine.init({ n, order }, 42)
        const states = [state]
        while (!state.finished) {
          state = examEngine.step(state)
          states.push(state)
        }
        expect(state.groups.flatMap(group => group.output)).toEqual(
          Array.from({ length: n }, (_, i) => i + 1),
        )
        expect(state.comparisons).toBe(divideComparisonCount(n))
        expect(state.groups.every(group => group.finished)).toBe(true)
        expect(examEngine.step(state)).toBe(state)
        for (let i = states.length - 2; i >= 0; i--) {
          state = examEngine.back!(state)
          expect(state).toEqual(states[i])
        }
      }
    }
  })

  it("30장은 세 묶음에서 각각 45회, 총 135회 비교한다", () => {
    let state = examEngine.init({ n: 30, order: "random" }, 1)
    state = examEngine.step(state)
    expect(state.comparisons).toBe(0)
    expect(state.groups.map(group => group.remaining.length)).toEqual([10, 10, 10])
    while (!state.finished) state = examEngine.step(state)
    expect(state.groups.map(group => group.comparisons)).toEqual([45, 45, 45])
    expect(state.comparisons).toBe(135)
  })

  it("직접 입력은 1~N번을 중복 없이 모두 포함해야 한다", () => {
    expect(parseExamInput("4-2-1-3", 4)).toEqual([4, 2, 1, 3])
    for (const invalid of ["1-1-3-4", "1-2-3", "0-2-3-4", "1-2-3-5"])
      expect(() => parseExamInput(invalid, 4)).toThrow(RangeError)
    expect(examEngine.init({ n: 4, order: "manual", papers: [4, 2, 1, 3] }, 1).papers).toEqual([
      4, 2, 1, 3,
    ])
  })
})
