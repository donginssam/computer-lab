import { normalizeCoins, type CoinSetId } from "../change/engine"
import { lockLimit } from "../lock/engine"
import { mergeSortComparisonLimit, type SortOrder } from "../sort/engine"

interface BaseExperiment {
  id: string
  strategy: "lock" | "change" | "sort"
}

export interface LockExperimentRecord extends BaseExperiment {
  strategy: "lock"
  digits: number
  placement: "worst" | "random" | "manual"
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
export const MAX_RECORDS = 500

export function mergeRecords(current: Experiment[], additions: Experiment[]) {
  const ids = new Set(current.map(record => record.id))
  const unique = additions.filter(record => {
    if (ids.has(record.id)) return false
    ids.add(record.id)
    return true
  })
  return [...current, ...unique].slice(-MAX_RECORDS)
}

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
    Number(record.digits) >= 1 &&
    Number(record.digits) <= 4 &&
    ["worst", "random", "manual"].includes(String(record.placement)) &&
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
    !Number.isInteger(record.amount) ||
    Number(record.amount) < 10 ||
    Number(record.amount) > 9990 ||
    Number(record.amount) % 10 !== 0 ||
    !["korea", "labA", "labB"].includes(String(record.coinSet)) ||
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
    Number(record.n) >= 2 &&
    Number(record.n) <= 16 &&
    ["random", "worst", "reverse", "manual"].includes(String(record.order)) &&
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
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(value) ? value.filter(isExperiment).slice(-MAX_RECORDS) : []
  } catch {
    return []
  }
}
