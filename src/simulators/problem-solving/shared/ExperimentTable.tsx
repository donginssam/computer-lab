import { formatCode } from "../lock/engine"
import { mergeSortComparisonLimit } from "../sort/engine"
import { MAX_RECORDS, type Experiment } from "./records"

const strategyName = {
  lock: "시행착오",
  change: "욕심쟁이",
  sort: "나누어 해결하기",
}

function problem(record: Experiment) {
  switch (record.strategy) {
    case "lock":
      return `${record.digits}자리 · ${record.placement === "worst" ? "가장 늦게 찾는 곳" : record.placement === "random" ? "무작위" : "직접 입력"}`
    case "change":
      return `${record.amount.toLocaleString()}원 · ${record.coins.join("·")}원`
    case "sort":
      return `${record.n}장 · ${record.order === "worst" ? "가장 많이 비교" : record.order === "reverse" ? "거꾸로" : record.order === "manual" ? "직접 입력" : "무작위"}`
  }
}

function result(record: Experiment) {
  switch (record.strategy) {
    case "lock":
      return `${formatCode(record.secret, record.digits)} · ${record.attempts.toLocaleString()}회`
    case "change":
      return record.stuck ? `동전 ${record.greedyCount}개 뒤 막힘` : `동전 ${record.greedyCount}개`
    case "sort":
      return `비교 ${record.comparisons}회`
  }
}

function comparison(record: Experiment) {
  switch (record.strategy) {
    case "lock":
      return `가장 많이 걸려도 ${(10 ** record.digits).toLocaleString()}회`
    case "change":
      return record.optimalCount === null
        ? "만들 수 있는 답 없음"
        : `가장 적은 개수 ${record.optimalCount}개`
    case "sort":
      return `가장 많이 걸려도 ${mergeSortComparisonLimit(record.n)}회`
  }
}

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
        <button type="button" disabled={!records.length} onClick={clear}>
          전체 삭제
        </button>
      </div>
      <p className="small-note">
        이 컴퓨터의 이 브라우저에만 최근 {MAX_RECORDS}개가 남습니다. 숨겨진 값은 실험을 끝낸 뒤에만
        기록됩니다.
      </p>
      {!records.length ? (
        <p className="empty-state">세 전략 중 하나를 끝까지 실행하면 여기에 기록이 쌓입니다.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">완료된 문제 해결 전략 실험 기록</caption>
            <thead>
              <tr>
                <th scope="col">전략</th>
                <th scope="col">문제</th>
                <th scope="col">실험 결과</th>
                <th scope="col">비교 기준</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{strategyName[record.strategy]}</td>
                  <td>{problem(record)}</td>
                  <td>{result(record)}</td>
                  <td>{comparison(record)}</td>
                  <td>
                    <button
                      type="button"
                      aria-label={`${strategyName[record.strategy]} ${problem(record)} 기록 삭제`}
                      onClick={() => remove(record.id)}
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
