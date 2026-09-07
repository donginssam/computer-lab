export type BoxId = number
export type Tilt = "left" | "right" | "balanced"
export type AlgorithmId = "sequential-pair" | "divide-half"
export interface Weighing {
  left: BoxId[]
  right: BoxId[]
  outside: BoxId[]
  result: Tilt
}
export interface SimState {
  n: number
  fakeIndex: BoxId
  candidates: BoxId[]
  comparisons: number
  history: Weighing[]
  finished: boolean
  answer?: BoxId
  cursor: number
}
export interface Algorithm {
  id: AlgorithmId
  name: string
  bigO: string
  maxComparisons: (n: number) => number
  worstCaseFakeIndex: (n: number) => BoxId
  init: (n: number, fakeIndex: BoxId) => SimState
  step: (state: SimState) => SimState
}
