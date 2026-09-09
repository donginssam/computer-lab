import { useCallback } from "react"
import { RunControls, type SpeedChoice } from "../../shared/RunControls"
import { useSaveOnce } from "../../shared/useSaveOnce"
import { StepLog } from "../shared/StepLog"
import type { Experiment } from "../shared/records"
import { useStepper } from "../shared/useStepper"
import { LockConcept } from "./LockConcept"
import { LockView } from "./LockView"
import { formatCode, lockEngine, lockLimit, type LockOptions } from "./engine"
import type { LockPlacement } from "../bounds"

const lockSpeeds: readonly SpeedChoice[] = [
  { label: "천천히 (1회씩)", speed: 800, batch: 1 },
  { label: "빠르게 (10회씩)", speed: 800, batch: 10 },
  { label: "아주 빠르게 (100회씩)", speed: 800, batch: 100 },
  { label: "끝까지 (1,000회씩)", speed: 800, batch: 1000 },
]

export function LockExperiment({
  digits,
  placement,
  manualSecret,
  save,
  initialBatch,
  onBatchChange,
}: {
  digits: 1 | 2 | 3 | 4
  placement: LockPlacement
  manualSecret: number
  save: (records: Experiment[]) => void
  initialBatch: number
  onBatchChange: (batch: number) => void
}) {
  const options: LockOptions = { digits }
  const createSeed = useCallback(() => {
    if (placement === "worst") return lockLimit(digits) - 1
    if (placement === "manual") return manualSecret
    return Math.floor(Math.random() * lockLimit(digits))
  }, [digits, placement, manualSecret])
  const { run, dispatch, done, step, reset, toggle } = useStepper({
    engine: lockEngine,
    options,
    createSeed,
    initialBatch,
  })

  useSaveOnce<Experiment>(
    save,
    done
      ? [
          {
            id: `${run.runId}:lock`,
            strategy: "lock",
            digits,
            placement,
            secret: run.state.secret,
            attempts: run.state.attempts,
          },
        ]
      : [],
  )

  const entries = run.state.recent.map(value =>
    value === run.state.secret
      ? `${formatCode(value, digits)} 시도 → 열렸습니다.`
      : `${formatCode(value, digits)} 시도 → 열리지 않았습니다.`,
  )

  return (
    <>
      <RunControls
        running={run.running}
        done={done}
        tick={run.tick}
        speed={run.speed}
        batch={run.batch}
        speeds={lockSpeeds}
        onStep={step}
        onBack={() => dispatch({ type: "back" })}
        onReset={reset}
        onToggle={toggle}
        onSpeed={(speed, batch) => {
          dispatch({ type: "speed", speed, batch })
          onBatchChange(batch)
        }}
      />
      <LockView state={run.state} />
      <section className="sim-card">
        <StepLog entries={entries} total={run.state.attempts} />
      </section>
      <LockConcept />
    </>
  )
}
