import type { AlgorithmId, SimState } from "../engine/types"
import { algorithms } from "../engine"
import { resultLabel, boxList } from "../copy"
import { BalanceScale } from "./BalanceScale"
export function StatsBar({ state, algorithm }: { state: SimState; algorithm: AlgorithmId }) {
  return (
    <dl className="stats">
      <div>
        <dt>전체 상자</dt>
        <dd>{state.n}개</dd>
      </div>
      <div>
        <dt>현재 비교</dt>
        <dd>{state.comparisons}회</dd>
      </div>
      <div>
        <dt>이론 최대</dt>
        <dd>{algorithms[algorithm].maxComparisons(state.n)}회</dd>
      </div>
    </dl>
  )
}
export function BoxGrid({ state }: { state: SimState }) {
  const last = state.history.at(-1)
  return (
    <>
      <div className="box-grid" aria-label="전체 상자 상태">
        {Array.from({ length: state.n }, (_, id) => {
          const answer = state.answer === id
          const excluded = !state.candidates.includes(id)
          const active = last?.left.includes(id) || last?.right.includes(id)
          const label = answer ? "정답" : excluded ? "제외" : active ? "비교 중 후보" : "후보"
          return (
            <span
              key={id}
              className={`box ${answer ? "answer" : excluded ? "excluded" : active ? "active" : ""}`}
              aria-label={`${id + 1}번 ${label}`}
              title={`${id + 1}번 ${label}`}
            >
              {answer ? "★" : excluded ? "×" : ""}
              {id + 1}
            </span>
          )
        })}
      </div>
      <p className="small-note">파랑: 비교 중 후보 · ×: 제외 · ★: 정답</p>
    </>
  )
}
export function StepLog({ state }: { state: SimState }) {
  return (
    <details className="step-log" open>
      <summary>단계 기록 ({state.history.length})</summary>
      <ol>
        {state.history.map((w, i) => (
          <li key={i} className={i === state.history.length - 1 ? "latest" : ""}>
            {i + 1}. [{boxList(w.left)}] 대 [{boxList(w.right)}] → {resultLabel[w.result]}
            {w.result === "balanced" ? " → 저울 밖 후보만 남깁니다." : " → 가벼운 쪽만 남깁니다."}
          </li>
        ))}
      </ol>
      {!state.history.length && <p>다음 단계를 눌러 첫 비교를 시작하세요.</p>}
    </details>
  )
}
export function SimulationView({ state, algorithm }: { state: SimState; algorithm: AlgorithmId }) {
  return (
    <section className="sim-card">
      <h2>
        {algorithms[algorithm].name} <small>{algorithms[algorithm].bigO}</small>
      </h2>
      <StatsBar state={state} algorithm={algorithm} />
      <BalanceScale weighing={state.history.at(-1)} />
      <p className="result" role="status" aria-live="polite">
        {state.finished
          ? `★ 완료! ${state.answer! + 1}번이 정답입니다. ${state.comparisons}회 비교했습니다.${state.history.at(-1)?.result === "balanced" ? " 남은 1개를 추가 비교 없이 확정했습니다." : ""}`
          : state.history.length
            ? resultLabel[state.history.at(-1)!.result]
            : "상자 속 정답은 숨겨져 있습니다. 비교를 시작하세요."}
      </p>
      <BoxGrid state={state} />
      <StepLog state={state} />
    </section>
  )
}
