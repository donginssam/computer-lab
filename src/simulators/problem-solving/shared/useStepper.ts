import { useCallback, useEffect, useReducer } from "react"
import { createRun, reduceRun, type StepEngine } from "./stepper"

function runId() {
  return crypto.randomUUID()
}

export function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        "input, select, textarea, button, a, summary, [contenteditable=true], [role=tab]",
      ),
    )
  )
}

export function useStepper<O, S>({
  engine,
  options,
  createSeed,
  initialSpeed = 800,
  initialBatch = 1,
}: {
  engine: StepEngine<O, S>
  options: O
  createSeed: () => number
  initialSpeed?: number
  initialBatch?: number
}) {
  const [run, dispatch] = useReducer(
    (state: ReturnType<typeof createRun<O, S>>, action: Parameters<typeof reduceRun<O, S>>[3]) =>
      reduceRun(engine, options, state, action),
    undefined,
    () => createRun(engine, options, createSeed(), runId(), initialSpeed, initialBatch),
  )
  const done = engine.isFinished(run.state)
  const step = useCallback(() => dispatch({ type: "step" }), [])
  const reset = useCallback(
    () => dispatch({ type: "reset", seed: createSeed(), runId: runId() }),
    [createSeed],
  )

  useEffect(() => {
    if (!run.running || done) return
    const timer = window.setTimeout(step, run.speed)
    return () => window.clearTimeout(timer)
  }, [run.running, run.speed, run.tick, done, step])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.repeat ||
        isInteractiveTarget(event.target)
      )
        return
      if (event.code === "Space") {
        event.preventDefault()
        step()
      }
      if (event.key.toLowerCase() === "r") reset()
      if (event.key.toLowerCase() === "a" && !done)
        dispatch({ type: "auto", running: !run.running })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, reset, done, run.running])

  return { run, dispatch, done, step, reset }
}
