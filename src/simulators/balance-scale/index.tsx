import { lazy, useMemo } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { clampCoinCount } from "./engine/core"
import { ControlPanel } from "./components/ControlPanel"
import { Simulation } from "./components/Simulation"
import { RecordsPanel } from "../shared/RecordsPanel"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { useRecords } from "../shared/useRecords"
import { modes } from "./modes"
import { ConceptCards } from "./components/ConceptCards"
import { ExperimentTable } from "./components/ExperimentTable"
import { readRecords, STORAGE_KEY } from "./state/records"
import type { Options } from "./state/reducer"
import "./simulator.css"
const ComplexityChart = lazy(() =>
  import("./components/ComplexityChart").then(m => ({ default: m.ComplexityChart })),
)
export function BalanceScalePage() {
  const unit = unitById("algorithm")!
  const [params, setParams] = useSearchParams()
  const n = clampCoinCount(params.get("n"))
  // 차례로 비교하기 is the naive method students reach for first, so it opens
  // the page; discovering 절반씩 나누기 is the point of the lesson.
  const algorithm = params.get("algorithm") === "divide-half" ? "divide-half" : "sequential-pair"
  const placement = params.get("placement") === "random" ? "random" : "worst"
  const mode = modes.find(m => m.id === params.get("mode"))?.id ?? "simulation"
  const options = useMemo<Options>(() => ({ n, algorithm, placement }), [n, algorithm, placement])
  const { records, storageError, save, remove, clear } = useRecords(STORAGE_KEY, readRecords)
  function change(key: string, value: string) {
    setParams(
      old => {
        const next = new URLSearchParams(old)
        next.set(key, value)
        return next
      },
      { replace: key !== "mode" },
    )
  }
  return (
    <div className="sim-page balance-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="balance-scale">
        겉모양이 같은 동전 여러 개 중 <strong>진짜보다 가벼운 가짜 동전이 딱 하나</strong>
        있습니다. 저울은 ‘왼쪽이 가볍다 / 오른쪽이 가볍다 / 양쪽이 같다’만 알려 줍니다. 가장 적은
        저울질로 가짜 동전을 찾아보세요.
      </SimulatorHeader>
      <TabList
        items={modes}
        current={mode}
        idPrefix="tab-"
        panelId="experiment-panel"
        label="실험 모드"
        change={next => change("mode", next)}
      />
      <section id="experiment-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} tabIndex={0}>
        {mode !== "records" && (
          <ControlPanel options={options} change={change} compare={mode === "compare"} />
        )}
        {(mode === "simulation" || mode === "compare") && (
          <Simulation
            key={`${mode}:${n}:${mode === "compare" ? "" : algorithm}:${placement}`}
            options={options}
            compare={mode === "compare"}
            save={save}
          />
        )}
        {mode === "records" && (
          <RecordsPanel
            storageError={storageError}
            table={<ExperimentTable records={records} remove={remove} clear={clear} />}
            chart={<ComplexityChart records={records} />}
          />
        )}
      </section>
      <p className="small-note">
        지금 주소를 복사하면 모드와 동전 수·알고리즘·가짜 동전 위치 설정을 그대로 전달할 수
        있습니다. 가짜 동전이 어디 있었는지와 어디까지 진행했는지는 함께 전달되지 않습니다.
      </p>
      <ConceptCards />
    </div>
  )
}
