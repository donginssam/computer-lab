import type { SimState, Tilt } from "./types"
export function tilt(left: number[], right: number[], fakeIndex: number): Tilt {
  if (left.length !== right.length) throw new Error("양쪽에 같은 수의 상자를 올려 주세요.")
  return left.includes(fakeIndex) ? "left" : right.includes(fakeIndex) ? "right" : "balanced"
}
export function init(n: number, fakeIndex: number): SimState {
  if (
    !Number.isInteger(n) ||
    n < 2 ||
    n > 100 ||
    !Number.isInteger(fakeIndex) ||
    fakeIndex < 0 ||
    fakeIndex >= n
  )
    throw new Error("상자 개수 또는 불량 위치가 올바르지 않습니다.")
  return {
    n,
    fakeIndex,
    candidates: Array.from({ length: n }, (_, i) => i),
    comparisons: 0,
    history: [],
    finished: false,
    cursor: 0,
  }
}
export function weigh(
  state: SimState,
  left: number[],
  right: number[],
  outside: number[],
): SimState {
  if (state.finished) return state
  const result = tilt(left, right, state.fakeIndex)
  const candidates = result === "left" ? left : result === "right" ? right : outside
  return {
    ...state,
    candidates,
    comparisons: state.comparisons + 1,
    history: [...state.history, { left, right, outside, result }],
    finished: candidates.length === 1,
    answer: candidates.length === 1 ? candidates[0] : undefined,
  }
}
