import { useCallback, useEffect, useReducer } from "react"
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
  useEffect(() => {
    if (!state.running || done) return
    const timer = window.setTimeout(step, state.speed)
    return () => window.clearTimeout(timer)
  }, [state.running, state.speed, state.tick, done, step])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.repeat ||
        !(event.target instanceof HTMLElement) ||
        event.target.closest(
          "input, select, textarea, button, a, summary, [contenteditable=true], [role=tab]",
        )
      )
        return
      if (event.code === "Space") {
        event.preventDefault()
        step()
      }
      if (event.key.toLowerCase() === "r") reset()
      if (event.key.toLowerCase() === "a" && !done)
        dispatch({ type: "auto", running: !state.running })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, reset, done, state.running])
  return { state, dispatch, done, step, reset }
}
