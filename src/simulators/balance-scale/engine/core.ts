import type { SimState, Tilt } from "./types"

export const COIN_MIN = 2
export const COIN_MAX = 100
/** 주소에 동전 수가 없거나 숫자가 아닐 때 쓰는 값. */
export const COIN_DEFAULT = 7

/**
 * 주소의 n 파라미터와 숫자 입력칸이 모두 이 함수를 지난다. 숫자가 아니면
 * 기본값으로, 숫자면 COIN_MIN~COIN_MAX 범위로 맞춘다. 두 입구가 같은 함수를
 * 쓰므로 `?n=0`과 입력칸의 `0`이 서로 다른 동전 수가 되는 일이 없다.
 */
export function clampCoinCount(value: string | number | null | undefined): number {
  const parsed = Number(value)
  if (value === null || value === undefined || value === "" || !Number.isFinite(parsed))
    return COIN_DEFAULT
  return Math.max(COIN_MIN, Math.min(COIN_MAX, Math.trunc(parsed)))
}

export function tilt(left: number[], right: number[], fakeIndex: number): Tilt {
  if (left.length !== right.length) throw new Error("양쪽에 같은 수의 동전을 올려 주세요.")
  return left.includes(fakeIndex) ? "left" : right.includes(fakeIndex) ? "right" : "balanced"
}
export function init(n: number, fakeIndex: number): SimState {
  if (
    !Number.isInteger(n) ||
    n < COIN_MIN ||
    n > COIN_MAX ||
    !Number.isInteger(fakeIndex) ||
    fakeIndex < 0 ||
    fakeIndex >= n
  )
    throw new Error("동전 수 또는 가짜 동전 위치가 올바르지 않습니다.")
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
