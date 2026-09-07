import { describe, expect, it } from "vitest"
import { algorithms } from "./index"
import { tilt } from "./core"
for (const algorithm of Object.values(algorithms)) {
  describe(algorithm.name, () => {
    it("N=2..100의 모든 위치에서 불변성을 유지하며 상한 이내에 정답을 찾는다", () => {
      for (let n = 2; n <= 100; n++) {
        let worst = 0
        for (let fake = 0; fake < n; fake++) {
          let state = algorithm.init(n, fake)
          while (!state.finished && state.comparisons <= algorithm.maxComparisons(n)) {
            Object.freeze(state.candidates)
            state.history.forEach(w => {
              Object.freeze(w.left)
              Object.freeze(w.right)
              Object.freeze(w.outside)
              Object.freeze(w)
            })
            Object.freeze(state.history)
            const before = Object.freeze(state)
            state = algorithm.step(before)
            expect(state.history.length).toBe(before.history.length + 1)
          }
          expect(state.answer).toBe(fake)
          expect(state.finished).toBe(true)
          expect(state.comparisons).toBeLessThanOrEqual(algorithm.maxComparisons(n))
          expect(algorithm.step(state)).toBe(state)
          worst = Math.max(worst, state.comparisons)
        }
        let state = algorithm.init(n, algorithm.worstCaseFakeIndex(n))
        while (!state.finished) state = algorithm.step(state)
        expect(state.comparisons).toBe(worst)
        expect(worst).toBe(algorithm.maxComparisons(n))
      }
    })
  })
}
it("홀수의 저울 밖 정답은 균형 한 번으로 확정한다", () => {
  const state = algorithms["divide-half"].step(algorithms["divide-half"].init(3, 2))
  expect(state.history[0]?.result).toBe("balanced")
  expect(state.answer).toBe(2)
  expect(state.comparisons).toBe(1)
})
it("잘못된 입력과 개수가 다른 저울질을 거부한다", () => {
  expect(() => algorithms["divide-half"].init(1, 0)).toThrow()
  expect(() => tilt([0, 1], [2], 0)).toThrow()
})
