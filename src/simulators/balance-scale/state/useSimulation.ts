import { useCallback, useEffect, useReducer } from "react"
import { algorithms } from "../engine"
import { createRun, reducer, type Options } from "./reducer"
export const newId = () => crypto.randomUUID()
export function chooseFake(options: Options) {
  return options.placement === "random"
    ? Math.floor(Math.random() * options.n)
    : algorithms[options.algorithm].worstCaseFakeIndex(options.n)
}
export function useSimulation(options: Options, compare: boolean) {
  const [state, dispatch] = useReducer(reducer, options, o => createRun(o, chooseFake(o), newId()))
  const done = compare
    ? Object.values(state.pair).every(s => s.finished)
    : state.pair[options.algorithm].finished
  const step = useCallback(() => dispatch({ type: "step", compare }), [compare])
  const reset = useCallback(
    () => dispatch({ type: "reset", fake: chooseFake(options), runId: newId() }),
    [options],
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
