import { useCallback, useEffect, useMemo, useRef } from "react"
import { RunControls } from "../shared/RunControls"
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
  const { run, dispatch, done, step, reset } = useStepper({
    engine: sortEngine,
    options,
    createSeed,
  })
  const saved = useRef(new Set<string>())
  useEffect(() => {
    if (!done || saved.current.has(run.runId)) return
    saved.current.add(run.runId)
    save([
      {
        id: `${run.runId}:sort`,
        strategy: "sort",
        n,
        order: order === "manual" && !cards ? "random" : order,
        comparisons: run.state.comparisons,
      },
    ])
  }, [done, run, n, order, cards, save])

  const entries = run.state.trace.slice(0, run.state.index).map(sortStepText)
  return (
    <>
      <RunControls
        running={run.running}
        done={done}
        tick={run.tick}
        speed={run.speed}
        batch={run.batch}
        dispatch={dispatch}
        step={step}
        reset={reset}
      />
      <SortView state={run.state} />
      <section className="ps-card">
        <StepLog entries={entries.slice(-30)} total={entries.length} />
      </section>
      <SortConcept />
    </>
  )
}
