import { algorithms } from "../engine"
import type { AlgorithmId, SimState } from "../engine/types"
export type Placement = "worst" | "random"
export interface Options {
  n: number
  algorithm: AlgorithmId
  placement: Placement
}
export interface RunState {
  options: Options
  pair: Record<AlgorithmId, SimState>
  running: boolean
  speed: number
  tick: number
  runId: string
}
export function createRun(options: Options, fake: number, runId: string): RunState {
  return {
    options,
    pair: {
      "sequential-pair": algorithms["sequential-pair"].init(options.n, fake),
      "divide-half": algorithms["divide-half"].init(options.n, fake),
    },
    running: false,
    speed: 800,
    tick: 0,
    runId,
  }
}
type Action =
  | { type: "step"; compare: boolean }
  | { type: "back" }
  | { type: "auto"; running: boolean }
  | { type: "speed"; speed: number }
  | { type: "reset"; fake: number; runId: string }
export function reducer(state: RunState, action: Action): RunState {
  switch (action.type) {
    case "step": {
      const ids: AlgorithmId[] = action.compare
        ? ["sequential-pair", "divide-half"]
        : [state.options.algorithm]
      if (ids.every(id => state.pair[id].finished)) return { ...state, running: false }
      const pair = { ...state.pair }
      ids.forEach(id => {
        pair[id] = algorithms[id].step(pair[id])
      })
      return {
        ...state,
        pair,
        tick: state.tick + 1,
        running: state.running && !ids.every(id => pair[id].finished),
      }
    }
    case "back": {
      if (!state.tick) return state
      const pair = { ...state.pair }
      for (const id of Object.keys(pair) as AlgorithmId[]) {
        const count = Math.min(state.tick - 1, pair[id].comparisons)
        pair[id] = algorithms[id].init(state.options.n, pair[id].fakeIndex)
        for (let i = 0; i < count; i++) pair[id] = algorithms[id].step(pair[id])
      }
      return { ...state, pair, tick: state.tick - 1, running: false }
    }
    case "auto":
      return { ...state, running: action.running }
    case "speed":
      return { ...state, speed: action.speed }
    case "reset":
      return { ...createRun(state.options, action.fake, action.runId), speed: state.speed }
  }
}
