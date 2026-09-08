import type { AlgorithmId, SimState } from "../engine/types"
import { algorithms } from "../engine"
import { resultLabel, coinLabel, coinList, term } from "../copy"
import { BalanceScale } from "./BalanceScale"
function StatsBar({ state, algorithm }: { state: SimState; algorithm: AlgorithmId }) {
  return (
    <dl className="stats">
      <div>
        <dt>전체 동전</dt>
        <dd>{state.n}개</dd>
      </div>
      <div>
        <dt>지금까지 {term.weighing}</dt>
        <dd>{state.comparisons}회</dd>
      </div>
      <div>
        <dt>가장 많이 걸려도</dt>
        <dd>{algorithms[algorithm].maxComparisons(state.n)}회</dd>
      </div>
    </dl>
  )
}
function CoinGrid({ state }: { state: SimState }) {
  const last = state.history.at(-1)
  return (
    <>
      <div className="coin-grid" aria-label="전체 동전 상태">
        {Array.from({ length: state.n }, (_, id) => {
          const answer = state.answer === id
          const excluded = !state.candidates.includes(id)
          const active = last?.left.includes(id) || last?.right.includes(id)
          const status = answer ? "answer" : excluded ? "excluded" : active ? "active" : "candidate"
          const label = `${id + 1}번 ${coinLabel[status]}`
          return (
            <span key={id} className={`coin ${status}`} aria-label={label} title={label}>
              {answer ? "★" : excluded ? "×" : ""}
              {id + 1}
            </span>
          )
        })}
      </div>
      <p className="small-note">
        파랑: {coinLabel.active} · ×: {coinLabel.excluded} · ★: {coinLabel.answer}(진짜보다 가벼운
        동전). 아직 ×가 붙지 않은 동전을 ‘{term.candidate}’라고 부릅니다.
      </p>
    </>
  )
}
function StepLog({ state }: { state: SimState }) {
  return (
    <details className="step-log" open>
      <summary>단계 기록 ({state.history.length})</summary>
      <ol>
        {state.history.map((w, i) => (
          <li key={i} className={i === state.history.length - 1 ? "latest" : ""}>
            {i + 1}. [{coinList(w.left)}] 대 [{coinList(w.right)}] → {resultLabel[w.result]}
            {w.result === "balanced" ? " → 저울 밖 후보만 남깁니다." : " → 가벼운 쪽만 남깁니다."}
          </li>
        ))}
      </ol>
      {!state.history.length && <p>다음 단계를 눌러 첫 {term.weighing}을 시작하세요.</p>}
    </details>
  )
}
export function SimulationView({ state, algorithm }: { state: SimState; algorithm: AlgorithmId }) {
  const { name, bigO, bigOPlain } = algorithms[algorithm]
  const lastWeighing = state.history.at(-1)
  let message = `어느 동전이 가짜인지는 아직 숨겨져 있습니다. ${term.weighing}을 시작하세요.`
  if (state.finished) {
    message = `★ 완료! ${state.answer! + 1}번이 진짜보다 가벼운 가짜 동전입니다. ${term.weighing} ${state.comparisons}회.`
    if (lastWeighing?.result === "balanced") {
      message +=
        " 마지막에 양쪽이 같아서, 저울 밖에 있던 동전 1개가 답입니다. 더 재지 않아도 됩니다."
    }
  } else if (lastWeighing) {
    message = resultLabel[lastWeighing.result]
  }
  return (
    <section className="sim-card">
      <h2>
        {name} <small>{bigO}</small>
      </h2>
      <p className="small-note">{bigOPlain}</p>
      <StatsBar state={state} algorithm={algorithm} />
      <BalanceScale weighing={lastWeighing} />
      <p className="result" role="status" aria-live="polite">
        {message}
      </p>
      <CoinGrid state={state} />
      <StepLog state={state} />
    </section>
  )
}
