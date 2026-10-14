import { useCallback, useMemo } from "react"
import { RunControls } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
import type { Experiment } from "../shared/records"
import { useStepper } from "../shared/useStepper"
import { ChangeConcept } from "./ChangeConcept"
import { ChangeView } from "./ChangeView"
import { changeEngine, type ChangeOptions, type CoinSetId } from "./engine"
import { optimalChange } from "./optimal"

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
      <ChangeConcept />
    </>
  )
}
