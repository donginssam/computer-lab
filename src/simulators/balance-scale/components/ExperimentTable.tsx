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
        이 브라우저에 최근 500개를 저장합니다. 불량 위치는 완료 후 공개됩니다.
      </p>
      {!records.length ? (
        <p className="empty-state">
          시뮬레이션이나 나란히 비교를 끝내면 기록이 쌓입니다. N=8, 16, 32, 64로 실험해 보세요.
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">완료된 알고리즘별 비교 횟수</caption>
            <thead>
              <tr>
                <th scope="col">N</th>
                <th scope="col">알고리즘</th>
                <th scope="col">불량 위치</th>
                <th scope="col">실제</th>
                <th scope="col">이론 최대</th>
                <th scope="col">관리</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.n}</td>
                  <td>{algorithms[r.algorithm].name}</td>
                  <td>
                    {r.fakePlacement === "worst" ? "기준 알고리즘 최악" : "무작위"} ·{" "}
                    {r.fakeIndex + 1}번
                  </td>
                  <td>{r.comparisons}회</td>
                  <td>{algorithms[r.algorithm].maxComparisons(r.n)}회</td>
                  <td>
                    <button
                      aria-label={`N=${r.n} ${algorithms[r.algorithm].name} ${r.comparisons}회 기록 삭제`}
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
