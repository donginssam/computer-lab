import { lazy, useCallback, useState } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { clampedParam, oneOfParam } from "../shared/params"
import { RecordsPanel } from "../shared/RecordsPanel"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { useRecords } from "../shared/useRecords"
import { clampAmount, clampDigits, LOCK_BATCHES, lockPlacements } from "./bounds"
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
import { EXAM_DEFAULT, clampExamCount, examOrders } from "./sort/exam"
import { ProblemBrief } from "./shared/ProblemBrief"
import { strategies, isStrategyId, type StrategyId } from "./strategies"
import "./simulator.css"

const RecordCharts = lazy(() =>
  import("./shared/RecordCharts").then(module => ({ default: module.RecordCharts })),
)

function lockBatchParam(value: string | null) {
  const parsed = Number(value)
  return LOCK_BATCHES.find(batch => batch === parsed) ?? 1000
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

  const n = clampedParam(params.get("n"), EXAM_DEFAULT, clampExamCount)
  const order = oneOfParam(params.get("order"), examOrders, "random")
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
      <SimulatorHeader unit={unit} slug="problem-solving" showLabLabel={false}>
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
            <ProblemBrief title="답을 찾을 수 있지만, 얼마나 많은 시도가 필요할까?">
              비밀번호를 모르는 <strong>{digits}자리 숫자 자물쇠</strong>가 있습니다.
              <br />
              가능한 번호를 하나씩 시도해 <strong>자물쇠를 여는 비밀번호</strong>를 찾아보세요.
            </ProblemBrief>
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
            <ProblemBrief title="지금 가장 좋아 보이는 선택이 최종 결과에서도 좋을까?">
              <strong>{amount.toLocaleString("ko-KR")}원</strong>을 동전으로 거슬러 주어야 합니다.
              사용할 수 있는 동전은{" "}
              <strong>{coins.map(value => `${value.toLocaleString("ko-KR")}원`).join(", ")}</strong>
              입니다.
              <br />
              동전을 가능한 적게 사용해서 <strong>정확한 금액</strong>을 만들어 보세요.
            </ProblemBrief>
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
            <SortPanel
              key={n}
              n={n}
              order={order}
              change={change}
              setManualCards={setManualCards}
            />
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
    </div>
  )
}
