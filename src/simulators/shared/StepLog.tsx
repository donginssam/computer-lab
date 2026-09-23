/**
 * 단계 기록. 긴 실험은 최근 몇 단계만 넘겨받으므로, 번호는 전체 단계 수(total)에서
 * 거꾸로 세어 붙인다. Tailwind 기본 스타일이 목록 번호를 숨기므로 번호를 글자로 쓴다.
 */
export function StepLog({
  entries,
  total = entries.length,
  empty = "다음 단계를 눌러 실험을 시작하세요.",
}: {
  entries: readonly string[]
  total?: number
  empty?: string
}) {
  const first = Math.max(1, total - entries.length + 1)
  return (
    <details className="step-log" open>
      <summary>단계 기록 ({total})</summary>
      {entries.length ? (
        <ol>
          {entries.map((entry, index) => (
            <li className={index === entries.length - 1 ? "latest" : ""} key={first + index}>
              {first + index}. {entry}
            </li>
          ))}
        </ol>
      ) : (
        <p className="small-note">{empty}</p>
      )}
    </details>
  )
}
