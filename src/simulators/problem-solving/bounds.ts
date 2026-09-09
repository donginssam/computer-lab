/**
 * 세 전략의 설정 범위. 주소(URL), 설정 패널, 저장된 기록 검사, 엔진 검증이
 * 모두 같은 값을 봐야 해서 한곳에 모은다.
 */
export type LockPlacement = "worst" | "random" | "manual"
export const lockPlacements: readonly LockPlacement[] = ["worst", "random", "manual"]

export const DIGIT_MIN = 1
export const DIGIT_MAX = 4

export const AMOUNT_MIN = 10
export const AMOUNT_MAX = 9990
export const AMOUNT_STEP = 10

export const CARD_MIN = 2
export const CARD_MAX = 16

function clampInteger(value: number, min: number, max: number) {
  return Math.trunc(Math.max(min, Math.min(max, value)))
}

export function clampDigits(value: number): 1 | 2 | 3 | 4 {
  return clampInteger(value, DIGIT_MIN, DIGIT_MAX) as 1 | 2 | 3 | 4
}

/** 금액은 10원 단위라, 범위로 자른 뒤 다시 단위에 맞춰 반올림한다. */
export function clampAmount(value: number) {
  return Math.round(clampInteger(value, AMOUNT_MIN, AMOUNT_MAX) / AMOUNT_STEP) * AMOUNT_STEP
}

export function clampCardCount(value: number) {
  return clampInteger(value, CARD_MIN, CARD_MAX)
}

export function isAmountInRange(value: number) {
  return (
    Number.isInteger(value) &&
    value >= AMOUNT_MIN &&
    value <= AMOUNT_MAX &&
    value % AMOUNT_STEP === 0
  )
}
