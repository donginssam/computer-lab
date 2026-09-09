import { useCallback, useReducer } from "react"
import { useRunLoop } from "../../shared/useRunLoop"
import { algorithms } from "../engine"
import type { AlgorithmId } from "../engine/types"
import { activeAlgorithms, createRun, reducer, type Options } from "./reducer"
/**
 * Side by side runs both algorithms, so there is no algorithm to read the
 * worst case from. It always uses the sequential scan's worst position: that
 * pins 차례로 비교하기 at its maximum for every N while 절반씩 나누기 stays at
 * or below ⌊log₂N⌋, which is the contrast the mode exists to show.
 */
export const WORST_CASE_BASELINE: AlgorithmId = "sequential-pair"
export function chooseFake(options: Options, compare: boolean) {
  if (options.placement === "random") return Math.floor(Math.random() * options.n)
  const baseline = compare ? WORST_CASE_BASELINE : options.algorithm
  return algorithms[baseline].worstCaseFakeIndex(options.n)
}
export function useSimulation(options: Options, compare: boolean) {
  const [state, dispatch] = useReducer(reducer, options, o =>
    createRun(o, chooseFake(o, compare), crypto.randomUUID()),
  )
  const done = activeAlgorithms(options, compare).every(id => state.pair[id].finished)
  const step = useCallback(() => dispatch({ type: "step", compare }), [compare])
  const reset = useCallback(
    () =>
      dispatch({ type: "reset", fake: chooseFake(options, compare), runId: crypto.randomUUID() }),
    [options, compare],
  )
  const toggle = useCallback(
    () => dispatch({ type: "auto", running: !state.running }),
    [state.running],
  )

  useRunLoop({
    running: state.running,
    speed: state.speed,
    tick: state.tick,
    done,
    step,
    reset,
    toggle,
  })

  return { state, dispatch, done, step, reset, toggle }
}
