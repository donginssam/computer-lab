import { lazy, useCallback, useState } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { clampedParam, oneOfParam } from "../shared/params"
import { RecordsPanel } from "../shared/RecordsPanel"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { useRecords } from "../shared/useRecords"
import {
  CARD_DEFAULT,
  clampAmount,
  clampCardCount,
  clampDigits,
  LOCK_BATCHES,
  lockPlacements,
} from "./bounds"
import { ChangeExperiment } from "./change/ChangeExperiment"
import { ChangePanel } from "./change/ChangePanel"
import { coinPresets, coinSetIds } from "./change/engine"
import { problemSolvingCopy } from "./copy"
import { LockExperiment } from "./lock/LockExperiment"
import { LockPanel } from "./lock/LockPanel"
import { lockLimit } from "./lock/engine"
import { ExperimentTable } from "./shared/ExperimentTable"
import { readRecords, STORAGE_KEY } from "./shared/records"
import { SortExperiment } from "./sort/SortExperiment"
import { SortPanel } from "./sort/SortPanel"
import { sortOrders } from "./sort/engine"
import { strategies, isStrategyId, type StrategyId } from "./strategies"
import "./simulator.css"

const RecordCharts = lazy(() =>
  import("./shared/RecordCharts").then(module => ({ default: module.RecordCharts })),
)

function lockBatchParam(value: string | null) {
  const parsed = Number(value)
  return LOCK_BATCHES.find(batch => batch === parsed) ?? 1
}

export function ProblemSolvingPage() {
  const unit = unitById("algorithm")!
  const [params, setParams] = useSearchParams()
  const strategyParam = params.get("strategy")
  const strategy: StrategyId = isStrategyId(strategyParam) ? strategyParam : "lock"
  const digits = clampedParam(params.get("d"), 4, clampDigits)
  const lockPlacement = oneOfParam(params.get("pos"), lockPlacements, "worst")
  const [manualSecret, setManualSecret] = useState(0)
  const lockBatch = lockBatchParam(params.get("speed"))
  const safeManualSecret = Math.min(manualSecret, lockLimit(digits) - 1)

  const coinSet = oneOfParam(params.get("coins"), coinSetIds, "korea")
  const preset = coinPresets.find(item => item.id === coinSet)!
  const amount = clampedParam(params.get("amount"), preset.exampleAmount, clampAmount)
  const coins = preset.coins

  const n = clampedParam(params.get("n"), CARD_DEFAULT, clampCardCount)
  const order = oneOfParam(params.get("order"), sortOrders, "random")
  const [manualCards, setManualCards] = useState<number[] | undefined>()
  const { records, storageError, save, remove, clear } = useRecords(STORAGE_KEY, readRecords)

  const change = useCallback(
    (updates: Record<string, string>, replace = true) => {
      setParams(
        current => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(updates)) next.set(key, value)
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  return (
    <div className="sim-page problem-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="problem-solving">
        {problemSolvingCopy.lead}
      </SimulatorHeader>
      <TabList
        items={strategies}
        current={strategy}
        idPrefix="ps-tab-"
        panelId="strategy-panel"
        label="문제 해결 전략"
        change={next => change({ strategy: next }, false)}
      />
      <section
        id="strategy-panel"
        role="tabpanel"
        aria-labelledby={`ps-tab-${strategy}`}
        tabIndex={0}
      >
        {strategy === "lock" && (
          <>
            <LockPanel
              digits={digits}
              placement={lockPlacement}
              manualSecret={safeManualSecret}
              change={change}
              setManualSecret={setManualSecret}
            />
            <LockExperiment
              key={`${digits}:${lockPlacement}:${safeManualSecret}`}
              digits={digits}
              placement={lockPlacement}
              manualSecret={safeManualSecret}
              save={save}
              initialBatch={lockBatch}
              onBatchChange={batch => change({ speed: String(batch) })}
            />
          </>
        )}
        {strategy === "change" && (
          <>
            <ChangePanel
              key={`${coinSet}:${coins.join("-")}`}
              amount={amount}
              coinSet={coinSet}
              change={change}
            />
            <ChangeExperiment
              key={`${amount}:${coinSet}:${coins.join("-")}`}
              amount={amount}
              coinSet={coinSet}
              coins={coins}
              save={save}
            />
          </>
        )}
        {strategy === "sort" && (
          <>
            <SortPanel n={n} order={order} change={change} setManualCards={setManualCards} />
            <SortExperiment
              key={`${n}:${order}:${manualCards?.join("-") ?? "fallback"}`}
              n={n}
              order={order}
              cards={manualCards}
              save={save}
            />
          </>
        )}
        {strategy === "records" && (
          <RecordsPanel
            storageError={storageError}
            table={<ExperimentTable records={records} remove={remove} clear={clear} />}
            chart={<RecordCharts records={records} />}
          />
        )}
      </section>
      {strategy !== "records" && (
        <p className="small-note ps-share-note">{problemSolvingCopy.hiddenSetting}</p>
      )}
    </div>
  )
}
