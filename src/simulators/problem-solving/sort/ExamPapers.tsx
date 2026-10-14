export function ExamPapers({
  values,
  active = [],
  sorted = [],
}: {
  values: readonly number[]
  active?: readonly number[]
  sorted?: readonly number[]
}) {
  return (
    <div className="exam-paper-row">
      {values.length ? (
        values.map(value => (
          <span
            key={value}
            aria-label={`${value}번 시험지`}
            className={`sort-card exam-paper ${active.includes(value) ? "active" : ""} ${sorted.includes(value) ? "sorted" : ""}`}
          >
            {value}
          </span>
        ))
      ) : (
        <span className="exam-empty">아직 없음</span>
      )}
    </div>
  )
}

export function ExamMethodHeader({ count }: { count: number }) {
  return (
    <div className="exam-method-header">
      <dl className="stats exam-counter">
        <div>
          <dt>비교 횟수</dt>
          <dd>{count}회</dd>
        </div>
      </dl>
    </div>
  )
}
