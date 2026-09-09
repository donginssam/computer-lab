import { lazy, Suspense, useCallback, useState } from "react"
import { useSearchParams } from "react-router"
import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { unitById, unitPath, unitStyle } from "../../content/units"
import { ChangeExperiment } from "./change/ChangeExperiment"
import { ChangePanel } from "./change/ChangePanel"
import { coinPresets, type CoinSetId } from "./change/engine"
import { problemSolvingCopy } from "./copy"
import { LockExperiment } from "./lock/LockExperiment"
import { LockPanel, type LockPlacement } from "./lock/LockPanel"
import { lockLimit } from "./lock/engine"
import { ExperimentTable } from "./shared/ExperimentTable"
import { useRecords } from "./shared/useRecords"
import { SortExperiment } from "./sort/SortExperiment"
import { SortPanel } from "./sort/SortPanel"
import type { SortOrder } from "./sort/engine"
import { StrategyTabs } from "./StrategyTabs"
import { isStrategyId, type StrategyId } from "./strategies"
import "./simulator.css"

const RecordCharts = lazy(() =>
  import("./shared/RecordCharts").then(module => ({ default: module.RecordCharts })),
)

/**
 * `Number(null)` and `Number("")` are both 0, so an absent parameter has to be
 * rejected before parsing — otherwise every default collapses to the minimum.
 */
function numericParam(value: string | null) {
  if (value === null || value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function integerParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = numericParam(value)
  return parsed === null ? fallback : Math.trunc(Math.max(min, Math.min(max, parsed)))
}

function amountParam(value: string | null, fallback: number) {
  const parsed = numericParam(value)
  if (parsed === null) return fallback
  return Math.round(Math.max(10, Math.min(9990, parsed)) / 10) * 10
}

function coinSetParam(value: string | null): CoinSetId {
  return ["korea", "labA", "labB"].includes(String(value)) ? (value as CoinSetId) : "korea"
}

function orderParam(value: string | null): SortOrder {
  return ["random", "worst", "reverse", "manual"].includes(String(value))
    ? (value as SortOrder)
    : "random"
}

function lockBatchParam(value: string | null) {
  const parsed = Number(value)
  return [1, 10, 100, 1000].includes(parsed) ? parsed : 1
}

export function ProblemSolvingPage() {
  const unit = unitById("algorithm")!
  const [params, setParams] = useSearchParams()
  const strategyParam = params.get("strategy")
  const strategy: StrategyId = isStrategyId(strategyParam) ? strategyParam : "lock"
  const digits = integerParam(params.get("d"), 4, 1, 4) as 1 | 2 | 3 | 4
  const lockPlacement: LockPlacement = ["worst", "random", "manual"].includes(
    String(params.get("pos")),
  )
    ? (params.get("pos") as LockPlacement)
    : "worst"
  const [manualSecret, setManualSecret] = useState(0)
  const lockBatch = lockBatchParam(params.get("speed"))
  const safeManualSecret = Math.min(manualSecret, lockLimit(digits) - 1)

  const coinSet = coinSetParam(params.get("coins"))
  const preset = coinPresets.find(item => item.id === coinSet)!
  const amount = amountParam(params.get("amount"), preset.exampleAmount)
  const coins = preset.coins

  const n = integerParam(params.get("n"), 8, 2, 16)
  const order = orderParam(params.get("order"))
  const [manualCards, setManualCards] = useState<number[] | undefined>()
  const { records, storageError, save, remove, clear } = useRecords()

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
    <div className="problem-page" style={unitStyle(unit)}>
      <Breadcrumb
        items={[{ label: unit.title, to: unitPath(unit) }, { label: problemSolvingCopy.title }]}
      />
      <header className="ps-header">
        <p className="ps-kicker">알고리즘 실험실 · 01</p>
        <h1>{problemSolvingCopy.title}</h1>
        <p className="mt-4">{problemSolvingCopy.lead}</p>
      </header>
      <StrategyTabs strategy={strategy} change={next => change({ strategy: next }, false)} />
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
          <>
            {storageError && (
              <p className="ps-input-error" role="status">
                기록을 저장할 수 없어 이 화면을 벗어나면 현재 기록이 사라집니다.
              </p>
            )}
            <ExperimentTable records={records} remove={remove} clear={clear} />
            <Suspense fallback={<p>그래프를 불러오는 중…</p>}>
              <RecordCharts records={records} />
            </Suspense>
          </>
        )}
      </section>
      {strategy !== "records" && (
        <p className="ps-note ps-share-note">{problemSolvingCopy.hiddenSetting}</p>
      )}
    </div>
  )
}
