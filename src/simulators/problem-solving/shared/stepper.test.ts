import { describe, expect, it } from "vitest"
import { createRun, reduceRun, type StepEngine } from "./stepper"

interface CountState {
  value: number
  limit: number
}

const engine: StepEngine<{ limit: number }, CountState> = {
  id: "count",
  name: "count",
  init: options => ({ value: 0, limit: options.limit }),
  step: state =>
    state.value >= state.limit
      ? state
      : { ...state, value: Math.min(state.limit, state.value + 1) },
  back: state => ({ ...state, value: Math.max(0, state.value - 1) }),
  isFinished: state => state.value >= state.limit,
}

describe("공용 실행기", () => {
  it("batch만큼 진행하고 한 tick 단위로 되감는다", () => {
    const options = { limit: 10 }
    let run = createRun(engine, options, 0, "run", 800, 3)
    run = reduceRun(engine, options, run, { type: "step" })
    run = reduceRun(engine, options, run, { type: "step" })
    expect(run.state.value).toBe(6)
    expect(run.tick).toBe(2)
    run = reduceRun(engine, options, run, { type: "back" })
    expect(run.state.value).toBe(3)
    expect(run.tick).toBe(1)
  })

  it("완료하면 자동 실행을 멈추고 이후 step을 무시한다", () => {
    const options = { limit: 2 }
    let run = { ...createRun(engine, options, 0, "run", 800, 10), running: true }
    run = reduceRun(engine, options, run, { type: "step" })
    expect(run.state.value).toBe(2)
    expect(run.running).toBe(false)
    expect(reduceRun(engine, options, run, { type: "step" })).toEqual(run)
  })

  it("reset은 속도와 batch를 유지한다", () => {
    const options = { limit: 3 }
    let run = createRun(engine, options, 0, "first", 400, 10)
    run = reduceRun(engine, options, run, { type: "reset", seed: 2, runId: "second" })
    expect(run).toMatchObject({ seed: 2, runId: "second", speed: 400, batch: 10, tick: 0 })
  })
})
