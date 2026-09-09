import { RunControls } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
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
  const { state, dispatch, done, step, reset, toggle } = useSimulation(options, compare)

  // 나란히 비교는 두 알고리즘이 서로 다른 시점에 끝나므로, 끝난 쪽부터 기록한다.
  const finished = activeAlgorithms(options, compare)
    .filter(algorithm => state.pair[algorithm].finished)
    .map(algorithm => ({
      id: `${state.runId}:${algorithm}`,
      n: options.n,
      algorithm,
      fakePlacement: options.placement,
      fakeIndex: state.pair[algorithm].fakeIndex,
      comparisons: state.pair[algorithm].comparisons,
    }))
  useSaveOnce(save, finished)

  return (
    <>
      <RunControls
        running={state.running}
        done={done}
        tick={state.tick}
        speed={state.speed}
        onStep={step}
        onBack={() => dispatch({ type: "back" })}
        onReset={reset}
        onToggle={toggle}
        onSpeed={speed => dispatch({ type: "speed", speed })}
      />
      {compare ? (
        <SideBySide state={state} />
      ) : (
        <SimulationView state={state.pair[options.algorithm]} algorithm={options.algorithm} />
      )}
    </>
  )
}
