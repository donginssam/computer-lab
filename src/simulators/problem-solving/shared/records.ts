import { MAX_RECORDS, readStoredRecords } from "../../shared/records"
import {
  CARD_MAX,
  CARD_MIN,
  DIGIT_MAX,
  DIGIT_MIN,
  isAmountInRange,
  lockPlacements,
  type LockPlacement,
} from "../bounds"
import { coinSetIds, normalizeCoins, type CoinSetId } from "../change/engine"
import { lockLimit } from "../lock/engine"
import { mergeSortComparisonLimit, sortOrders, type SortOrder } from "../sort/engine"

export { MAX_RECORDS }

interface BaseExperiment {
  id: string
  strategy: "lock" | "change" | "sort"
}

export interface LockExperimentRecord extends BaseExperiment {
  strategy: "lock"
  digits: number
  placement: LockPlacement
  secret: number
  attempts: number
}

export interface ChangeExperimentRecord extends BaseExperiment {
  strategy: "change"
  amount: number
  coinSet: CoinSetId
  coins: number[]
  greedyCount: number
  optimalCount: number | null
  stuck: boolean
}

export interface SortExperimentRecord extends BaseExperiment {
  strategy: "sort"
  n: number
  order: SortOrder
  comparisons: number
}

export type Experiment = LockExperimentRecord | ChangeExperimentRecord | SortExperimentRecord

export const STORAGE_KEY = "computer-lab.problem-solving.v1"

function validBase(value: unknown): value is Record<string, unknown> & BaseExperiment {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === "string" && ["lock", "change", "sort"].includes(String(record.strategy))
  )
}

function validLock(record: Record<string, unknown>) {
  return (
    record.strategy === "lock" &&
    Number.isInteger(record.digits) &&
    Number(record.digits) >= DIGIT_MIN &&
    Number(record.digits) <= DIGIT_MAX &&
    lockPlacements.includes(String(record.placement) as LockPlacement) &&
    Number.isInteger(record.secret) &&
    Number(record.secret) >= 0 &&
    Number(record.secret) < lockLimit(Number(record.digits)) &&
    Number.isInteger(record.attempts) &&
    Number(record.attempts) === Number(record.secret) + 1
  )
}

function validChange(record: Record<string, unknown>) {
  if (
    record.strategy !== "change" ||
    !isAmountInRange(Number(record.amount)) ||
    !coinSetIds.includes(String(record.coinSet) as CoinSetId) ||
    !Array.isArray(record.coins) ||
    !Number.isInteger(record.greedyCount) ||
    Number(record.greedyCount) < 0 ||
    typeof record.stuck !== "boolean" ||
    !(
      record.optimalCount === null ||
      (Number.isInteger(record.optimalCount) && Number(record.optimalCount) > 0)
    )
  )
    return false
  try {
    const coins = record.coins as number[]
    const normalized = normalizeCoins(coins)
    return normalized.length === coins.length && normalized.every((coin, i) => coin === coins[i])
  } catch {
    return false
  }
}

function validSort(record: Record<string, unknown>) {
  return (
    record.strategy === "sort" &&
    Number.isInteger(record.n) &&
    Number(record.n) >= CARD_MIN &&
    Number(record.n) <= CARD_MAX &&
    sortOrders.includes(String(record.order) as SortOrder) &&
    Number.isInteger(record.comparisons) &&
    Number(record.comparisons) >= 1 &&
    Number(record.comparisons) <= mergeSortComparisonLimit(Number(record.n))
  )
}

export function isExperiment(value: unknown): value is Experiment {
  if (!validBase(value)) return false
  const record = value as Record<string, unknown>
  return validLock(record) || validChange(record) || validSort(record)
}

export function readRecords() {
  return readStoredRecords(STORAGE_KEY, isExperiment)
}
