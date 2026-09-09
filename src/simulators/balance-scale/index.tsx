import { lazy, Suspense, useMemo } from "react"
import { useSearchParams } from "react-router"
import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { unitById, unitPath, unitStyle } from "../../content/units"
import { clampCoinCount } from "./engine/core"
import { ControlPanel } from "./components/ControlPanel"
import { Simulation } from "./components/Simulation"
import { ModeTabs } from "./components/ModeTabs"
import { modes } from "./modes"
import { ConceptCards } from "./components/ConceptCards"
import { ExperimentTable } from "./components/ExperimentTable"
import { useRecords } from "./state/useRecords"
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
  const { records, storageError, save, remove, clear } = useRecords()
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
    <div className="balance-page" style={unitStyle(unit)}>
      <Breadcrumb
        items={[{ label: unit.title, to: unitPath(unit) }, { label: "양팔저울로 가짜 동전 찾기" }]}
      />
      <header className="mt-6">
        <p className="small-note">알고리즘 실험실 · 02</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">양팔저울로 가짜 동전 찾기</h1>
        <p className="mt-4">
          겉모양이 같은 동전 여러 개 중 <strong>진짜보다 가벼운 가짜 동전이 딱 하나</strong>
          있습니다. 저울은 ‘왼쪽이 가볍다 / 오른쪽이 가볍다 / 양쪽이 같다’만 알려 줍니다. 가장 적은
          저울질로 가짜 동전을 찾아보세요.
        </p>
      </header>
      <ModeTabs mode={mode} change={mode => change("mode", mode)} />
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
          <>
            {storageError && (
              <p role="status">기록을 저장할 수 없어서, 이 화면을 벗어나면 기록이 사라집니다.</p>
            )}
            <ExperimentTable records={records} remove={remove} clear={clear} />
            <Suspense fallback={<p>그래프를 불러오는 중…</p>}>
              <ComplexityChart records={records} />
            </Suspense>
          </>
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
