import { algorithms } from "../engine"
import { COIN_MAX, COIN_MIN } from "../engine/core"
import { algorithmIds, type AlgorithmId } from "../engine/types"
import type { Placement } from "./reducer"
export interface Experiment {
  id: string
  n: number
  algorithm: AlgorithmId
  fakePlacement: Placement
  fakeIndex: number
  comparisons: number
}
export const STORAGE_KEY = "computer-lab.balance-scale.v1"
export const MAX_RECORDS = 500

export function mergeRecords(current: Experiment[], additions: Experiment[]): Experiment[] {
  const ids = new Set(current.map(record => record.id))
  const unique = additions.filter(record => {
    if (ids.has(record.id)) return false
    ids.add(record.id)
    return true
  })
  return [...current, ...unique].slice(-MAX_RECORDS)
}

export function readRecords(): Experiment[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (r): r is Experiment =>
          r &&
          typeof r.id === "string" &&
          Number.isInteger(r.n) &&
          r.n >= COIN_MIN &&
          r.n <= COIN_MAX &&
          algorithmIds.includes(r.algorithm) &&
          ["worst", "random"].includes(r.fakePlacement) &&
          Number.isInteger(r.fakeIndex) &&
          r.fakeIndex >= 0 &&
          r.fakeIndex < r.n &&
          Number.isInteger(r.comparisons) &&
          r.comparisons > 0 &&
          // 알고리즘마다 상한이 다르므로 그 알고리즘의 상한으로 검사한다.
          r.comparisons <= algorithms[r.algorithm as AlgorithmId].maxComparisons(r.n),
      )
      .slice(-MAX_RECORDS)
  } catch {
    return []
  }
}
