export function StepLog({
  entries,
  total,
  empty = "다음 단계를 눌러 실험을 시작하세요.",
}: {
  entries: readonly string[]
  total: number
  empty?: string
}) {
  return (
    <details className="step-log" open>
      <summary>단계 기록 ({total})</summary>
      {entries.length ? (
        <ol start={Math.max(1, total - entries.length + 1)}>
          {entries.map((entry, index) => (
            <li className={index === entries.length - 1 ? "latest" : ""} key={`${total}:${index}`}>
              {entry}
            </li>
          ))}
        </ol>
      ) : (
        <p className="small-note">{empty}</p>
      )}
    </details>
  )
}
