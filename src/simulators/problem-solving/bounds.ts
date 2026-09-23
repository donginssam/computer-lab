import { clampInteger } from "../shared/params"

/**
 * 세 전략의 설정 범위. 주소(URL), 설정 패널, 저장된 기록 검사, 엔진 검증이
 * 모두 같은 값을 봐야 해서 한곳에 모은다.
 */
export type LockPlacement = "worst" | "random" | "manual"
export const lockPlacements: readonly LockPlacement[] = ["worst", "random", "manual"]

export const DIGIT_MIN = 1
export const DIGIT_MAX = 4
/** 자릿수 선택지. 설정 패널과 기록 그래프의 가로축이 함께 쓴다. */
export const DIGIT_CHOICES = Array.from(
  { length: DIGIT_MAX - DIGIT_MIN + 1 },
  (_, index) => DIGIT_MIN + index,
)

/** 자물쇠는 한 번에 여러 번 시도할 수 있다. 주소의 speed 값도 이 중 하나여야 한다. */
export const LOCK_BATCHES = [1, 10, 100, 1000] as const
export type LockBatch = (typeof LOCK_BATCHES)[number]

export const AMOUNT_MIN = 10
export const AMOUNT_MAX = 9990
export const AMOUNT_STEP = 10

export const CARD_MIN = 2
export const CARD_MAX = 16
/** 주소에 카드 수가 없거나 숫자가 아닐 때 쓰는 값. */
export const CARD_DEFAULT = 8
/** 직접 입력하는 숫자 카드에 쓸 수 있는 값. */
export const CARD_VALUE_MIN = 1
export const CARD_VALUE_MAX = 99

export function clampDigits(value: number): 1 | 2 | 3 | 4 {
  return clampInteger(value, DIGIT_MIN, DIGIT_MAX) as 1 | 2 | 3 | 4
}

/** 금액은 10원 단위라, 범위로 자른 뒤 다시 단위에 맞춰 반올림한다. */
export function clampAmount(value: number) {
  return Math.round(clampInteger(value, AMOUNT_MIN, AMOUNT_MAX) / AMOUNT_STEP) * AMOUNT_STEP
}

/**
 * 범위 안의 금액 하나를 단위에 맞춰 고르게 고른다. 선택지 수를 최솟값부터 세므로
 * 최솟값이 단위와 달라도 범위를 넘지 않는다.
 */
export function randomAmount(random = Math.random) {
  const choices = Math.floor((AMOUNT_MAX - AMOUNT_MIN) / AMOUNT_STEP) + 1
  return AMOUNT_MIN + Math.floor(random() * choices) * AMOUNT_STEP
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
