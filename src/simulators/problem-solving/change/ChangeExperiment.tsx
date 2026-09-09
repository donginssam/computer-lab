import { useCallback, useMemo } from "react"
import { RunControls } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
import { StepLog } from "../shared/StepLog"
import type { Experiment } from "../shared/records"
import { useStepper } from "../shared/useStepper"
import { ChangeConcept } from "./ChangeConcept"
import { ChangeView } from "./ChangeView"
import { changeEngine, type ChangeOptions, type ChangeState, type CoinSetId } from "./engine"
import { optimalChange } from "./optimal"

function changeStepEntries(state: ChangeState) {
  const entries: string[] = []
  let remaining = state.amount
  for (const coin of state.used) {
    entries.push(
      `남은 ${remaining.toLocaleString()}원 → ${coin.toLocaleString()}원 동전을 고릅니다.`,
    )
    remaining -= coin
  }
  if (state.stuck)
    entries.push(`남은 ${remaining.toLocaleString()}원 → 쓸 수 있는 동전이 없습니다.`)
  return entries
}

export function ChangeExperiment({
  amount,
  coinSet,
  coins,
  save,
}: {
  amount: number
  coinSet: CoinSetId
  coins: number[]
  save: (records: Experiment[]) => void
}) {
  const options = useMemo<ChangeOptions>(() => ({ amount, coins }), [amount, coins])
  const createSeed = useCallback(() => 0, [])
  const { run, dispatch, done, step, reset, toggle } = useStepper({
    engine: changeEngine,
    options,
    createSeed,
  })
  const optimal = useMemo(() => optimalChange(amount, coins), [amount, coins])

  useSaveOnce<Experiment>(
    save,
    done
      ? [
          {
            id: `${run.runId}:change`,
            strategy: "change",
            amount,
            coinSet,
            coins,
            greedyCount: run.state.used.length,
            optimalCount: optimal?.count ?? null,
            stuck: run.state.stuck,
          },
        ]
      : [],
  )

  const entries = changeStepEntries(run.state)
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
      <ChangeView state={run.state} optimal={optimal} />
      <section className="sim-card">
        <StepLog entries={entries} total={entries.length} />
      </section>
      <ChangeConcept />
    </>
  )
}
