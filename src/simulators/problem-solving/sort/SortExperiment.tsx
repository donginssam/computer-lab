import { useCallback, useMemo } from "react"
import { RunControls, type SpeedChoice } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
import type { Experiment } from "../shared/records"
import { useStepper } from "../shared/useStepper"
import { SortConcept } from "./SortConcept"
import { SortView } from "./SortView"
import { examEngine, type ExamOptions, type ExamOrder } from "./exam"

const speeds: readonly SpeedChoice[] = [
  { label: "느림 (1.5초)", speed: 1500, batch: 1 },
  { label: "보통 (0.8초)", speed: 800, batch: 1 },
  { label: "빠름 (10단계씩)", speed: 400, batch: 10 },
  { label: "끝까지 (한 번에)", speed: 800, batch: 1000 },
]

export function SortExperiment({
  n,
  order,
  cards,
  save,
}: {
  n: number
  order: ExamOrder
  cards?: number[]
  save: (records: Experiment[]) => void
}) {
  const options = useMemo<ExamOptions>(() => ({ n, order, papers: cards }), [n, order, cards])
  const createSeed = useCallback(() => Math.floor(Math.random() * 0x1_0000_0000), [])
  const { run, dispatch, done, step, reset, toggle } = useStepper({
    engine: examEngine,
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
            task: "exam",
            n,
            order: order === "manual" && !cards ? "random" : order,
            comparisons: run.state.comparisons,
          },
        ]
      : [],
  )
  return (
    <>
      <RunControls
        running={run.running}
        done={done}
        tick={run.tick}
        speed={run.speed}
        batch={run.batch}
        speeds={speeds}
        onStep={step}
        onBack={() => dispatch({ type: "back" })}
        onReset={reset}
        onToggle={toggle}
        onSpeed={(speed, batch) => dispatch({ type: "speed", speed, batch })}
      />
      <SortView state={run.state} />
      <SortConcept />
    </>
  )
}
