import { lazy, Suspense, useCallback, useState } from "react"
import { useSearchParams } from "react-router"
import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { unitById, unitPath, unitStyle } from "../../content/units"
import { TabList } from "../shared/TabList"
import { useRecords } from "../shared/useRecords"
import { clampAmount, clampCardCount, clampDigits, lockPlacements } from "./bounds"
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

/**
 * `Number(null)` and `Number("")` are both 0, so an absent parameter has to be
 * rejected before parsing — otherwise every default collapses to the minimum.
 */
function numericParam(value: string | null) {
  if (value === null || value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** 주소에 값이 없으면 기본값을, 있으면 설정 패널과 같은 범위로 보정해 쓴다. */
function clampedParam<T>(value: string | null, fallback: T, clamp: (value: number) => T) {
  const parsed = numericParam(value)
  return parsed === null ? fallback : clamp(parsed)
}

function oneOfParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
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
  const digits = clampedParam(params.get("d"), 4, clampDigits)
  const lockPlacement = oneOfParam(params.get("pos"), lockPlacements, "worst")
  const [manualSecret, setManualSecret] = useState(0)
  const lockBatch = lockBatchParam(params.get("speed"))
  const safeManualSecret = Math.min(manualSecret, lockLimit(digits) - 1)

  const coinSet = oneOfParam(params.get("coins"), coinSetIds, "korea")
  const preset = coinPresets.find(item => item.id === coinSet)!
  const amount = clampedParam(params.get("amount"), preset.exampleAmount, clampAmount)
  const coins = preset.coins

  const n = clampedParam(params.get("n"), 8, clampCardCount)
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
      <Breadcrumb
        items={[{ label: unit.title, to: unitPath(unit) }, { label: problemSolvingCopy.title }]}
      />
      <header className="ps-header">
        <p className="ps-kicker">알고리즘 실험실 · 01</p>
        <h1>{problemSolvingCopy.title}</h1>
        <p className="mt-4">{problemSolvingCopy.lead}</p>
      </header>
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
        <p className="small-note ps-share-note">{problemSolvingCopy.hiddenSetting}</p>
      )}
    </div>
  )
}
