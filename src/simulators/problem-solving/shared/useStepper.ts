import { useCallback, useReducer } from "react"
import { useRunLoop } from "../../shared/useRunLoop"
import { createRun, reduceRun, type StepEngine } from "./stepper"

function runId() {
  return crypto.randomUUID()
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
  const toggle = useCallback(() => dispatch({ type: "auto", running: !run.running }), [run.running])

  useRunLoop({ running: run.running, speed: run.speed, tick: run.tick, done, step, reset, toggle })

  return { run, dispatch, done, step, reset, toggle }
}
