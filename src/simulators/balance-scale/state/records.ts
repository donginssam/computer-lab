import type { AlgorithmId } from "../engine/types"
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
          r.n >= 2 &&
          r.n <= 100 &&
          ["sequential-pair", "divide-half"].includes(r.algorithm) &&
          ["worst", "random"].includes(r.fakePlacement) &&
          Number.isInteger(r.fakeIndex) &&
          r.fakeIndex >= 0 &&
          r.fakeIndex < r.n &&
          Number.isInteger(r.comparisons) &&
          r.comparisons > 0 &&
          r.comparisons <= Math.floor(r.n / 2),
      )
      .slice(-500)
  } catch {
    return []
  }
}
