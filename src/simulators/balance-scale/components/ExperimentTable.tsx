import type { Experiment } from "../state/records"
import { algorithms } from "../engine"
export function ExperimentTable({
  records,
  remove,
  clear,
}: {
  records: Experiment[]
  remove: (id: string) => void
  clear: () => void
}) {
  return (
    <section className="sim-card">
      <div className="section-title">
        <h2>실험 기록 ({records.length})</h2>
        <button disabled={!records.length} onClick={clear}>
          전체 삭제
        </button>
      </div>
      <p className="small-note">
        이 컴퓨터의 이 브라우저에만 최근 500개가 남습니다. 가짜 동전이 어디였는지는 실험이 끝난 뒤에
        보여 줍니다.
      </p>
      {!records.length ? (
        <p className="empty-state">
          시뮬레이션이나 나란히 비교를 끝내면 기록이 쌓입니다. 동전 8개, 16개, 32개, 64개로 실험해
          보세요.
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">완료된 알고리즘별 저울질 횟수</caption>
            <thead>
              <tr>
                <th scope="col">동전 수</th>
                <th scope="col">알고리즘</th>
                <th scope="col">가짜 동전 위치</th>
                <th scope="col">실제 저울질</th>
                <th scope="col">가장 많이 걸려도</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.n}</td>
                  <td>{algorithms[r.algorithm].name}</td>
                  <td>
                    {r.fakePlacement === "worst" ? "가장 늦게 찾는 곳" : "무작위"} ·{" "}
                    {r.fakeIndex + 1}번
                  </td>
                  <td>{r.comparisons}회</td>
                  <td>{algorithms[r.algorithm].maxComparisons(r.n)}회</td>
                  <td>
                    <button
                      aria-label={`동전 ${r.n}개 ${algorithms[r.algorithm].name} 저울질 ${r.comparisons}회 기록 삭제`}
                      onClick={() => remove(r.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
