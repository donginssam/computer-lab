import type { ChangeSolution } from "./optimal"
import type { ChangeState } from "./engine"

function coinCounts(values: readonly number[]) {
  return values.reduce<Record<number, number>>((counts, coin) => {
    counts[coin] = (counts[coin] ?? 0) + 1
    return counts
  }, {})
}

function composition(values: readonly number[]) {
  if (!values.length) return "없음"
  return Object.entries(coinCounts(values))
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([coin, count]) => `${Number(coin).toLocaleString()}원×${count}`)
    .join(" + ")
}

export function ChangeView({
  state,
  optimal,
}: {
  state: ChangeState
  optimal: ChangeSolution | null
}) {
  const greedyBetter =
    state.finished && !state.stuck && optimal && state.used.length === optimal.count
  return (
    <section className="ps-card change-scene">
      <div className="ps-section-title">
        <div>
          <p className="ps-kicker">욕심쟁이 방법</p>
          <h2>지금 고를 수 있는 가장 큰 동전</h2>
        </div>
        <span className="strategy-chip change-chip">빠른 판단</span>
      </div>
      <dl className="ps-stats">
        <div>
          <dt>처음 금액</dt>
          <dd>{state.amount.toLocaleString()}원</dd>
        </div>
        <div>
          <dt>남은 금액</dt>
          <dd>{state.remaining.toLocaleString()}원</dd>
        </div>
        <div>
          <dt>고른 동전</dt>
          <dd>{state.used.length}개</dd>
        </div>
      </dl>
      <label className="ps-progress-label">
        만든 금액
        <progress max={state.amount} value={state.amount - state.remaining} />
        <span>{state.amount - state.remaining}원</span>
      </label>
      <div className="coin-shelf" aria-label="사용할 수 있는 동전">
        {state.coins.map((coin, tier) => (
          <span className="change-coin available" data-tier={tier} key={coin}>
            {coin}
          </span>
        ))}
      </div>
      <div className="coin-tray" aria-label={`고른 동전 ${state.used.length}개`}>
        {state.used.length ? (
          state.used.map((coin, index) => (
            <span
              className="change-coin chosen"
              data-tier={state.coins.indexOf(coin)}
              key={`${coin}:${index}`}
            >
              {coin}
            </span>
          ))
        ) : (
          <span className="ps-note">고른 동전이 여기에 놓입니다.</span>
        )}
      </div>
      <p className="ps-result" role="status" aria-live="polite">
        {state.stuck
          ? `${state.remaining.toLocaleString()}원이 남았지만 쓸 수 있는 동전이 없어 막힙니다.`
          : state.finished
            ? `${composition(state.used)}으로 만들었습니다. 모두 ${state.used.length}개입니다.`
            : state.used.length
              ? `${state.used.at(-1)!.toLocaleString()}원 동전을 골랐습니다.`
              : "다음 단계를 눌러 첫 동전을 골라 보세요."}
      </p>
      {state.finished && (
        <div className={`optimal-row ${greedyBetter ? "same" : "different"}`}>
          <strong>가장 적은 개수</strong>
          {optimal ? (
            <span>
              {composition(optimal.coins)} = {optimal.count}개
            </span>
          ) : (
            <span>이 동전들로는 금액을 만들 수 없습니다.</span>
          )}
          {optimal && (
            <span>{greedyBetter ? "욕심쟁이 결과와 같습니다." : "욕심쟁이 결과와 다릅니다."}</span>
          )}
        </div>
      )}
    </section>
  )
}
