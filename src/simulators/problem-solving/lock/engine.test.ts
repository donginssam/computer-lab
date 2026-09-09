import { describe, expect, it } from "vitest"
import { formatCode, lockEngine, lockLimit, type LockOptions } from "./engine"

function finish(digits: 1 | 2 | 3 | 4, secret: number) {
  let state = lockEngine.init({ digits }, secret)
  while (!state.finished) state = lockEngine.step(state)
  return state
}

describe("시행착오 자물쇠 엔진", () => {
  it("1~3자리의 모든 비밀번호를 정확히 secret + 1회에 찾는다", () => {
    for (const digits of [1, 2, 3] as const) {
      for (let secret = 0; secret < lockLimit(digits); secret += 1) {
        const state = finish(digits, secret)
        expect(state.attempts).toBe(secret + 1)
        expect(state.current).toBe(secret)
      }
    }
  })

  it.each([0, 1, 4321, 9999])("4자리 경계값과 표본 %i를 찾는다", secret => {
    expect(finish(4, secret).attempts).toBe(secret + 1)
  })

  it("최근 20회만 남기고 되감기와 종료 후 호출이 안정적이다", () => {
    let state = lockEngine.init({ digits: 2 }, 99)
    for (let index = 0; index < 30; index += 1) state = lockEngine.step(state)
    expect(state.recent).toHaveLength(20)
    expect(state.recent[0]).toBe(10)
    state = lockEngine.back!(state)
    expect(state.attempts).toBe(29)
    expect(state.current).toBe(29)
    const done = finish(1, 0)
    expect(lockEngine.step(done)).toBe(done)
  })

  it("코드를 자릿수에 맞게 표시하고 잘못된 입력을 거부한다", () => {
    expect(formatCode(7, 4)).toBe("0007")
    expect(() => lockEngine.init({ digits: 0 } as unknown as LockOptions, 0)).toThrow()
    expect(() => lockEngine.init({ digits: 2 }, 100)).toThrow()
  })
})
