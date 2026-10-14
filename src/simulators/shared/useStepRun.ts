import { useCallback, useReducer, useState } from "react"
import { useRunLoop } from "./useRunLoop"

interface RunState {
  tick: number
  running: boolean
  speed: number
}

type Action =
  | { type: "step"; last: number }
  | { type: "back" }
  | { type: "reset" }
  | { type: "auto"; running: boolean }
  | { type: "speed"; speed: number }

function reduce(state: RunState, action: Action): RunState {
  switch (action.type) {
    case "step":
      if (state.tick >= action.last) return { ...state, running: false }
      return {
        ...state,
        tick: state.tick + 1,
        running: state.running && state.tick + 1 < action.last,
      }
    case "back":
      return { ...state, tick: Math.max(0, state.tick - 1), running: false }
    case "reset":
      return { ...state, tick: 0, running: false }
    case "auto":
      return { ...state, running: action.running }
    case "speed":
      return { ...state, speed: action.speed }
  }
}

/**
 * 0부터 last까지 한 칸씩 나아가는 단계 실행. 기록을 남기지 않는 짧은 과정(2로 나누기,
 * 소리 디지털화)이 공용 RunControls·useRunLoop 위에 그대로 올라가도록 상태와 콜백을 묶는다.
 * resetKey가 바뀌면 처음부터 다시 시작한다. 속도는 그대로 둔다.
 */
export function useStepRun(last: number, resetKey?: unknown) {
  const [run, dispatch] = useReducer(reduce, { tick: 0, running: false, speed: 800 })
  // 컴포넌트를 새로 만들지 않고 렌더 중에 되돌려야 입력칸이 남긴 경고가 함께 사라지지 않는다.
  const [runFor, setRunFor] = useState(resetKey)
  if (!Object.is(runFor, resetKey)) {
    setRunFor(resetKey)
    dispatch({ type: "reset" })
  }
  const tick = Math.min(run.tick, last)
  const done = tick >= last

  const step = useCallback(() => dispatch({ type: "step", last }), [last])
  const reset = useCallback(() => dispatch({ type: "reset" }), [])
  const toggle = useCallback(() => dispatch({ type: "auto", running: !run.running }), [run.running])
  useRunLoop({ running: run.running, speed: run.speed, tick, done, step, reset, toggle })

  return {
    tick,
    done,
    /** RunControls에 그대로 펼쳐 넘기는 값 */
    controls: {
      running: run.running,
      done,
      tick,
      speed: run.speed,
      onStep: step,
      onBack: () => dispatch({ type: "back" }),
      onReset: reset,
      onToggle: toggle,
      onSpeed: (speed: number) => dispatch({ type: "speed", speed }),
    },
  }
}
