import { MAX_RECORDS, readStoredRecords } from "../../shared/records"
import { algorithms } from "../engine"
import { COIN_MAX, COIN_MIN } from "../engine/core"
import { algorithmIds, type AlgorithmId } from "../engine/types"
import type { Placement } from "./reducer"

export { MAX_RECORDS }

export interface Experiment {
  id: string
  n: number
  algorithm: AlgorithmId
  fakePlacement: Placement
  fakeIndex: number
  comparisons: number
}

export const STORAGE_KEY = "computer-lab.balance-scale.v1"

function isExperiment(value: unknown): value is Experiment {
  const record = value as Experiment
  return (
    Boolean(record) &&
    typeof record.id === "string" &&
    Number.isInteger(record.n) &&
    record.n >= COIN_MIN &&
    record.n <= COIN_MAX &&
    algorithmIds.includes(record.algorithm) &&
    ["worst", "random"].includes(record.fakePlacement) &&
    Number.isInteger(record.fakeIndex) &&
    record.fakeIndex >= 0 &&
    record.fakeIndex < record.n &&
    Number.isInteger(record.comparisons) &&
    record.comparisons > 0 &&
    // 알고리즘마다 상한이 다르므로 그 알고리즘의 상한으로 검사한다.
    record.comparisons <= algorithms[record.algorithm].maxComparisons(record.n)
  )
}

export function readRecords(): Experiment[] {
  return readStoredRecords(STORAGE_KEY, isExperiment)
}
