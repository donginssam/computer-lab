import { describe, expect, it } from "vitest"
import { changeEngine, coinPresets, normalizeCoins } from "./engine"
import { optimalChange } from "./optimal"

function finish(amount: number, coins: number[]) {
  let state = changeEngine.init({ amount, coins }, 0)
  while (!state.finished) state = changeEngine.step(state)
  return state
}

describe("욕심쟁이 거스름돈 엔진", () => {
  it("한국 동전은 10~9990원에서 가장 적은 개수와 같다", () => {
    const coins = coinPresets[0].coins
    for (let amount = 10; amount <= 9990; amount += 10) {
      const greedy = finish(amount, coins)
      expect(greedy.stuck).toBe(false)
      expect(greedy.used).toHaveLength(optimalChange(amount, coins)!.count)
    }
  })

  it("실험용 A에서 120원과 180원의 더 짧은 구성을 찾는다", () => {
    const coins = coinPresets[1].coins
    expect(finish(120, coins).used).toEqual([100, 10, 10])
    expect(optimalChange(120, coins)).toEqual({ count: 2, coins: [60, 60] })
    expect(finish(180, coins).used).toHaveLength(4)
    expect(optimalChange(180, coins)?.count).toBe(3)
  })

  it("실험용 B에서 욕심쟁이는 막히지만 만들 수 있는 답은 있다", () => {
    const coins = coinPresets[2].coins
    const greedy = finish(60, coins)
    expect(greedy).toMatchObject({ used: [50], remaining: 10, stuck: true })
    expect(optimalChange(60, coins)).toEqual({ count: 2, coins: [30, 30] })
  })

  it("동전 목록을 정렬하고 잘못된 값을 거부한다", () => {
    expect(normalizeCoins([60, 100, 10])).toEqual([100, 60, 10])
    // 10원 단위가 아닌 값은 예외 없이 걸러 냅니다.
    expect(normalizeCoins([100, 25, 10])).toEqual([100, 10])
    expect(() => normalizeCoins([100])).toThrow()
    expect(() => normalizeCoins([10, 20, 30, 40, 50, 60])).toThrow()
    expect(() => changeEngine.init({ amount: 0, coins: [100, 10] }, 0)).toThrow()
  })

  it("종료 후 호출은 같은 상태를 돌려주고 되감으면 한 단계 전으로 간다", () => {
    const done = finish(120, [100, 60, 10])
    expect(changeEngine.step(done)).toBe(done)
    const previous = changeEngine.back!(done)
    expect(previous).toMatchObject({ remaining: 10, used: [100, 10], finished: false })
  })
})
