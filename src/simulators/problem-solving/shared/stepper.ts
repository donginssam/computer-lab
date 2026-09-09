export interface StepEngine<O, S> {
  id: string
  name: string
  init(options: O, seed: number): S
  step(state: S): S
  isFinished(state: S): boolean
  back?(state: S): S
}

export interface RunState<S> {
  state: S
  seed: number
  running: boolean
  speed: number
  batch: number
  tick: number
  runId: string
  /** 각 화면 갱신에서 실제로 실행한 step 수. batch 단위 되감기에 사용한다. */
  tickSteps: number[]
}

export type StepAction =
  | { type: "step"; count?: number }
  | { type: "back" }
  | { type: "auto"; running: boolean }
  | { type: "speed"; speed: number; batch: number }
  | { type: "reset"; seed: number; runId: string }

export function createRun<O, S>(
  engine: StepEngine<O, S>,
  options: O,
  seed: number,
  runId: string,
  speed = 800,
  batch = 1,
): RunState<S> {
  return {
    state: engine.init(options, seed),
    seed,
    running: false,
    speed,
    batch,
    tick: 0,
    runId,
    tickSteps: [],
  }
}

function validCount(value: number | undefined, fallback: number) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback
}

export function reduceRun<O, S>(
  engine: StepEngine<O, S>,
  options: O,
  state: RunState<S>,
  action: StepAction,
): RunState<S> {
  switch (action.type) {
    case "step": {
      if (engine.isFinished(state.state)) return { ...state, running: false }
      const count = validCount(action.count, state.batch)
      let next = state.state
      let performed = 0
      while (performed < count && !engine.isFinished(next)) {
        next = engine.step(next)
        performed += 1
      }
      const finished = engine.isFinished(next)
      return {
        ...state,
        state: next,
        running: state.running && !finished,
        tick: state.tick + 1,
        tickSteps: [...state.tickSteps, performed],
      }
    }
    case "back": {
      if (!state.tick) return state
      const previousSteps = state.tickSteps.at(-1) ?? 1
      const remainingTicks = state.tickSteps.slice(0, -1)
      let previous: S
      if (engine.back) {
        previous = state.state
        for (let i = 0; i < previousSteps; i += 1) previous = engine.back(previous)
      } else {
        previous = engine.init(options, state.seed)
        const replayCount = remainingTicks.reduce((sum, count) => sum + count, 0)
        for (let i = 0; i < replayCount; i += 1) previous = engine.step(previous)
      }
      return {
        ...state,
        state: previous,
        running: false,
        tick: state.tick - 1,
        tickSteps: remainingTicks,
      }
    }
    case "auto":
      return engine.isFinished(state.state)
        ? { ...state, running: false }
        : { ...state, running: action.running }
    case "speed":
      return {
        ...state,
        speed: validCount(action.speed, state.speed),
        batch: validCount(action.batch, state.batch),
      }
    case "reset":
      return createRun(engine, options, action.seed, action.runId, state.speed, state.batch)
  }
}
