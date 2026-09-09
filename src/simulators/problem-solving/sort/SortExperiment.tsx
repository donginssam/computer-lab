import { useCallback, useMemo } from "react"
import { RunControls } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
import { StepLog } from "../shared/StepLog"
import type { Experiment } from "../shared/records"
import { useStepper } from "../shared/useStepper"
import { SortConcept } from "./SortConcept"
import { SortView } from "./SortView"
import { sortEngine, sortStepText, type SortOptions, type SortOrder } from "./engine"

export function SortExperiment({
  n,
  order,
  cards,
  save,
}: {
  n: number
  order: SortOrder
  cards?: number[]
  save: (records: Experiment[]) => void
}) {
  const options = useMemo<SortOptions>(() => ({ n, order, cards }), [n, order, cards])
  const createSeed = useCallback(() => Math.floor(Math.random() * 0x1_0000_0000), [])
  const { run, dispatch, done, step, reset, toggle } = useStepper({
    engine: sortEngine,
    options,
    createSeed,
  })

  useSaveOnce<Experiment>(
    save,
    done
      ? [
          {
            id: `${run.runId}:sort`,
            strategy: "sort",
            n,
            // 직접 입력이 비어 있으면 엔진이 무작위 카드로 돌아가므로, 기록도 그렇게 남긴다.
            order: order === "manual" && !cards ? "random" : order,
            comparisons: run.state.comparisons,
          },
        ]
      : [],
  )

  const entries = run.state.trace.slice(0, run.state.index).map(sortStepText)
  return (
    <>
      <RunControls
        running={run.running}
        done={done}
        tick={run.tick}
        speed={run.speed}
        batch={run.batch}
        onStep={step}
        onBack={() => dispatch({ type: "back" })}
        onReset={reset}
        onToggle={toggle}
        onSpeed={(speed, batch) => dispatch({ type: "speed", speed, batch })}
      />
      <SortView state={run.state} />
      <section className="sim-card">
        <StepLog entries={entries.slice(-30)} total={entries.length} />
      </section>
      <SortConcept />
    </>
  )
}
