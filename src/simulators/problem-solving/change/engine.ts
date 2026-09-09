import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP, isAmountInRange } from "../bounds"
import type { StepEngine } from "../shared/stepper"

export type CoinSetId = "korea" | "labA" | "labB"

export interface ChangeOptions {
  amount: number
  coins: number[]
}

export interface ChangeState {
  amount: number
  coins: number[]
  remaining: number
  used: number[]
  finished: boolean
  stuck: boolean
}

export interface CoinPreset {
  id: CoinSetId
  name: string
  coins: number[]
  exampleAmount: number
}

export const coinPresets: readonly CoinPreset[] = [
  { id: "korea", name: "한국 동전", coins: [500, 100, 50, 10], exampleAmount: 870 },
  { id: "labA", name: "실험용 동전 A", coins: [100, 60, 10], exampleAmount: 120 },
  { id: "labB", name: "실험용 동전 B", coins: [50, 30, 20], exampleAmount: 60 },
]

export const coinSetIds: readonly CoinSetId[] = coinPresets.map(preset => preset.id)

export function normalizeCoins(values: readonly number[]) {
  const coins = [...new Set(values)]
    .filter(value => Number.isInteger(value) && value > 0 && value % 10 === 0)
    .sort((a, b) => b - a)
  if (coins.length < 2 || coins.length > 5)
    throw new RangeError("동전은 10원 단위로 2~5종을 입력해 주세요.")
  return coins
}

function validate(options: ChangeOptions) {
  if (!isAmountInRange(options.amount))
    throw new RangeError(`금액은 ${AMOUNT_MIN}~${AMOUNT_MAX}원의 ${AMOUNT_STEP}원 단위여야 합니다.`)
  const normalized = normalizeCoins(options.coins)
  if (
    normalized.length !== options.coins.length ||
    normalized.some((coin, i) => coin !== options.coins[i])
  )
    throw new RangeError("동전은 중복 없이 큰 값부터 정렬되어야 합니다.")
}

export const changeEngine: StepEngine<ChangeOptions, ChangeState> = {
  id: "change",
  name: "욕심쟁이 방법",
  init(options) {
    validate(options)
    return {
      amount: options.amount,
      coins: [...options.coins],
      remaining: options.amount,
      used: [],
      finished: false,
      stuck: false,
    }
  },
  step(state) {
    if (state.finished) return state
    const coin = state.coins.find(value => value <= state.remaining)
    if (coin === undefined) return { ...state, finished: true, stuck: true }
    const remaining = state.remaining - coin
    return {
      ...state,
      remaining,
      used: [...state.used, coin],
      finished: remaining === 0,
    }
  },
  back(state) {
    if (state.stuck) return { ...state, finished: false, stuck: false }
    const coin = state.used.at(-1)
    if (coin === undefined) return state
    return {
      ...state,
      remaining: state.remaining + coin,
      used: state.used.slice(0, -1),
      finished: false,
      stuck: false,
    }
  },
  isFinished: state => state.finished,
}
