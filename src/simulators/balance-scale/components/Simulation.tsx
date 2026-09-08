import { useEffect, useRef } from "react"
import { useSimulation } from "../state/useSimulation"
import { activeAlgorithms, type Options } from "../state/reducer"
import type { Experiment } from "../state/records"
import { SimulationView } from "./SimulationView"
import { SideBySide } from "./SideBySide"

export function Simulation({
  options,
  compare,
  save,
}: {
  options: Options
  compare: boolean
  save: (records: Experiment[]) => void
}) {
  const { state, dispatch, done, step, reset } = useSimulation(options, compare)
  const saved = useRef(new Set<string>())
  useEffect(() => {
    const ids = activeAlgorithms(options, compare)
    const additions: Experiment[] = []
    for (const algorithm of ids) {
      const sim = state.pair[algorithm]
      const id = `${state.runId}:${algorithm}`
      if (sim.finished && !saved.current.has(id)) {
        saved.current.add(id)
        additions.push({
          id,
          n: options.n,
          algorithm,
          fakePlacement: options.placement,
          fakeIndex: sim.fakeIndex,
          comparisons: sim.comparisons,
        })
      }
    }
    if (additions.length) save(additions)
  }, [state, options, compare, save])
  return (
    <>
      <div className="sim-card button-row">
        <label>
          속도{" "}
          <select
            value={state.speed}
            onChange={e => dispatch({ type: "speed", speed: Number(e.target.value) })}
          >
            <option value={400}>빠름 (0.4초)</option>
            <option value={800}>보통 (0.8초)</option>
            <option value={1500}>느림 (1.5초)</option>
          </select>
        </label>
        <button onClick={reset}>초기화</button>
        <button disabled={!state.tick} onClick={() => dispatch({ type: "back" })}>
          ◀ 이전
        </button>
        <button disabled={done || state.running} onClick={step}>
          다음 단계 ▶
        </button>
        <button
          className="primary"
          disabled={done}
          onClick={() => dispatch({ type: "auto", running: !state.running })}
        >
          {state.running ? "Ⅱ 일시 정지" : "▶ 자동 실행"}
        </button>
        <p className="small-note">
          단축키: Space 다음 단계 · R 초기화 · A 자동 실행/정지 (입력 칸이나 버튼을 클릭한 상태가
          아닐 때)
        </p>
      </div>
      {compare ? (
        <SideBySide state={state} />
      ) : (
        <SimulationView state={state.pair[options.algorithm]} algorithm={options.algorithm} />
      )}
    </>
  )
}
