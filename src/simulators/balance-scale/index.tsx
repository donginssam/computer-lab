import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { unitById, unitPath } from "../../content/units"
import { ControlPanel } from "./components/ControlPanel"
import { SimulationView } from "./components/SimulationView"
import { SideBySide } from "./components/SideBySide"
import { TryItYourself } from "./components/TryItYourself"
import { ConceptCards } from "./components/ConceptCards"
import { ExperimentTable } from "./components/ExperimentTable"
import { useSimulation } from "./state/useSimulation"
import type { Options } from "./state/reducer"
import { readRecords, STORAGE_KEY, type Experiment } from "./state/records"
import type { AlgorithmId } from "./engine/types"
import "./simulator.css"
const ComplexityChart = lazy(() =>
  import("./components/ComplexityChart").then(m => ({ default: m.ComplexityChart })),
)
const modes = [
  { id: "simulation", title: "시뮬레이션" },
  { id: "compare", title: "나란히 비교" },
  { id: "try", title: "직접 해보기" },
  { id: "records", title: "실험 기록" },
]
function Simulation({
  options,
  compare,
  save,
}: {
  options: Options
  compare: boolean
  save: (records: Experiment[]) => void
}) {
  const { state, dispatch, done, step, reset } = useSimulation(options, compare)
  const saved = useRef(new Set<string>())
  useEffect(() => {
    const ids: AlgorithmId[] = compare ? ["sequential-pair", "divide-half"] : [options.algorithm]
    const additions: Experiment[] = []
    for (const algorithm of ids) {
      const sim = state.pair[algorithm]
      const id = `${state.runId}:${algorithm}`
      if (sim.finished && !saved.current.has(id)) {
        saved.current.add(id)
        additions.push({
          id,
          n: options.n,
          algorithm,
          fakePlacement: options.placement,
          fakeIndex: sim.fakeIndex,
          comparisons: sim.comparisons,
        })
      }
    }
    if (additions.length) save(additions)
  }, [state, options, compare, save])
  return (
    <>
      <div className="sim-card button-row">
        <label>
          속도{" "}
          <select
            value={state.speed}
            onChange={e => dispatch({ type: "speed", speed: Number(e.target.value) })}
          >
            <option value={400}>빠름 (0.4초)</option>
            <option value={800}>보통 (0.8초)</option>
            <option value={1500}>느림 (1.5초)</option>
          </select>
        </label>
        <button onClick={reset}>초기화</button>
        <button disabled={!state.tick} onClick={() => dispatch({ type: "back" })}>
          ◀ 이전
        </button>
        <button disabled={done || state.running} onClick={step}>
          다음 단계 ▶
        </button>
        <button
          className="primary"
          disabled={done}
          onClick={() => dispatch({ type: "auto", running: !state.running })}
        >
          {state.running ? "Ⅱ 일시 정지" : "▶ 자동 실행"}
        </button>
        <p className="small-note">
          단축키: Space 다음 단계 · R 초기화 · A 자동 실행/정지 (입력·버튼에 초점이 없을 때)
        </p>
      </div>
      {compare ? (
        <SideBySide state={state} />
      ) : (
        <SimulationView state={state.pair[options.algorithm]} algorithm={options.algorithm} />
      )}
    </>
  )
}
export function BalanceScalePage() {
  const unit = unitById("algorithm")!
  const [params, setParams] = useSearchParams()
  const rawN = Number(params.get("n") ?? 7)
  const n = Number.isFinite(rawN) ? Math.max(2, Math.min(100, Math.trunc(rawN))) : 7
  const algorithm =
    params.get("algorithm") === "sequential-pair" ? "sequential-pair" : "divide-half"
  const placement = params.get("placement") === "random" ? "random" : "worst"
  const mode = modes.find(m => m.id === params.get("mode"))?.id ?? "simulation"
  const options = useMemo<Options>(() => ({ n, algorithm, placement }), [n, algorithm, placement])
  const [records, setRecords] = useState(readRecords)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    // Storage is external; expose write failure so users know records are temporary.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      // eslint-disable-next-line react/set-state-in-effect
      setStorageError(false)
    } catch {
      // eslint-disable-next-line react/set-state-in-effect
      setStorageError(true)
    }
  }, [records])
  const save = useCallback(
    (additions: Experiment[]) =>
      setRecords(old =>
        [...old, ...additions.filter(a => !old.some(r => r.id === a.id))].slice(-500),
      ),
    [setRecords],
  )
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
    <div className="balance-page" style={{ "--unit": unit.color } as React.CSSProperties}>
      <Breadcrumb
        items={[
          { label: unit.title, to: unitPath(unit) },
          { label: "양팔저울로 알고리즘 비교하기" },
        ]}
      />
      <header className="mt-6">
        <p className="small-note">알고리즘 실험실 · 01</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">양팔저울로 알고리즘 비교하기</h1>
        <p className="mt-4">
          겉모양이 같은 상자 N개 중 <strong>딱 하나만 가볍습니다.</strong> 저울은 ‘왼쪽이 가볍다 /
          오른쪽이 가볍다 / 같다’만 알려 줍니다. 가장 적은 저울질로 정답을 찾아보세요.
        </p>
      </header>
      <div className="mode-tabs" role="tablist" aria-label="실험 모드">
        {modes.map((m, i) => (
          <button
            key={m.id}
            id={`tab-${m.id}`}
            role="tab"
            aria-selected={mode === m.id}
            aria-controls="experiment-panel"
            tabIndex={mode === m.id ? 0 : -1}
            onClick={() => change("mode", m.id)}
            onKeyDown={e => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % modes.length
                  : e.key === "ArrowLeft"
                    ? (i + modes.length - 1) % modes.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? modes.length - 1
                        : -1
              if (next >= 0) {
                e.preventDefault()
                change("mode", modes[next]!.id)
                document.getElementById(`tab-${modes[next]!.id}`)?.focus()
              }
            }}
          >
            {m.title}
          </button>
        ))}
      </div>
      <section id="experiment-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} tabIndex={0}>
        {mode !== "records" && (
          <ControlPanel options={options} change={change} manual={mode === "try"} />
        )}
        {(mode === "simulation" || mode === "compare") && (
          <Simulation
            key={`${mode}:${n}:${algorithm}:${placement}`}
            options={options}
            compare={mode === "compare"}
            save={save}
          />
        )}
        {mode === "try" && <TryItYourself key={n} n={n} />}
        {mode === "records" && (
          <>
            {storageError && (
              <p role="status">
                브라우저 저장 공간을 사용할 수 없어 현재 화면에서만 기록을 유지합니다.
              </p>
            )}
            <ExperimentTable
              records={records}
              remove={id => setRecords(old => old.filter(r => r.id !== id))}
              clear={() => setRecords([])}
            />
            <Suspense fallback={<p>그래프를 불러오는 중…</p>}>
              <ComplexityChart records={records} />
            </Suspense>
          </>
        )}
      </section>
      <p className="small-note">
        현재 주소를 복사하면 모드와 상자 수·알고리즘·불량 위치 설정을 공유할 수 있습니다. 무작위
        정답과 진행 단계는 공유되지 않습니다.
      </p>
      <ConceptCards />
    </div>
  )
}
