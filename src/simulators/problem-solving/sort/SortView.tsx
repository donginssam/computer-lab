import { mergeSortComparisonLimit, sortStepText, type SortState, type SortStep } from "./engine"

function CardRow({
  values,
  active = [],
}: {
  values: readonly number[]
  active?: readonly number[]
}) {
  return (
    <div className="sort-card-row">
      {values.map((value, index) => (
        <span
          className={`sort-card ${active.includes(value) ? "active" : ""}`}
          key={`${value}:${index}`}
        >
          {value}
        </span>
      ))}
    </div>
  )
}

function StepGroups({ step }: { step: SortStep }) {
  if (step.kind === "split")
    return (
      <>
        <CardRow values={step.left} />
        <span aria-hidden="true">+</span>
        <CardRow values={step.right} />
      </>
    )
  if (step.kind === "merged") return <CardRow values={step.values} />
  return (
    <>
      <CardRow
        values={[...step.output, ...step.remainingLeft, ...step.remainingRight]}
        active={step.kind === "compare" ? [step.left, step.right] : []}
      />
    </>
  )
}

export function SortView({ state }: { state: SortState }) {
  const applied = state.trace.slice(0, state.index)
  const current = applied.at(-1)
  const splits = applied.filter(step => step.kind === "split").length
  const merges = applied.filter(step => step.kind === "merged").length
  const latestByDepth = new Map<number, SortStep>()
  for (const step of applied) latestByDepth.set(step.depth, step)
  const sorted = state.trace.at(-1)

  return (
    <section className="sim-card sort-scene">
      <div className="section-title">
        <div>
          <p className="ps-kicker">작은 문제로 나누어 해결하기</p>
          <h2>나누고, 정리하고, 합치기</h2>
        </div>
        <span className="strategy-chip sort-chip">많아도 빠름</span>
      </div>
      <dl className="stats">
        <div>
          <dt>나눈 횟수</dt>
          <dd>{splits}회</dd>
        </div>
        <div>
          <dt>비교 횟수</dt>
          <dd>{state.comparisons}회</dd>
        </div>
        <div>
          <dt>가장 많이 걸려도</dt>
          <dd>{mergeSortComparisonLimit(state.cards.length)}회</dd>
        </div>
      </dl>
      <div className="sort-workspace" aria-label="카드 정리 과정">
        <div className="sort-depth-row">
          <strong>처음</strong>
          <CardRow values={state.cards} />
        </div>
        {[...latestByDepth.entries()].map(([depth, step]) => (
          <div className="sort-depth-row current" key={depth}>
            <strong>{depth + 1}단계 깊이</strong>
            <div className="sort-groups">
              <StepGroups step={step} />
            </div>
          </div>
        ))}
      </div>
      <p className="result" role="status" aria-live="polite">
        {state.finished && sorted?.kind === "merged"
          ? `${sorted.values.join(" → ")} 순서로 정리했습니다. 비교는 ${state.comparisons}회입니다.`
          : current
            ? sortStepText(current)
            : "다음 단계를 눌러 카드 묶음을 나눠 보세요."}
      </p>
      <p className="small-note">지금까지 합치기를 끝낸 묶음은 {merges}개입니다.</p>
    </section>
  )
}
