export type CoinId = number
export type Tilt = "left" | "right" | "balanced"
export const algorithmIds = ["sequential-pair", "divide-half"] as const
export type AlgorithmId = (typeof algorithmIds)[number]
export interface Weighing {
  left: CoinId[]
  right: CoinId[]
  outside: CoinId[]
  result: Tilt
}
export interface SimState {
  n: number
  fakeIndex: CoinId
  candidates: CoinId[]
  comparisons: number
  history: Weighing[]
  finished: boolean
  answer?: CoinId
  cursor: number
}
export interface Algorithm {
  id: AlgorithmId
  name: string
  /** Same wording as `name`, trimmed for table headers and chart legends. */
  shortName: string
  bigO: string
  /** Plain-language gloss of `bigO`, shown before the notation. */
  bigOPlain: string
  maxComparisons: (n: number) => number
  worstCaseFakeIndex: (n: number) => CoinId
  init: (n: number, fakeIndex: CoinId) => SimState
  step: (state: SimState) => SimState
}
