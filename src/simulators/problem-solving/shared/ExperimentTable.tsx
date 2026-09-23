import { lockPlacementLabel, sortOrderLabel } from "../copy"
import { formatCode, lockLimit } from "../lock/engine"
import { mergeSortComparisonLimit } from "../sort/engine"
import { strategyNames } from "../strategies"
import { RecordTable, type RecordColumn } from "../../shared/RecordTable"
import type { Experiment } from "./records"

function problem(record: Experiment) {
  switch (record.strategy) {
    case "lock":
      return `${record.digits}자리 · ${lockPlacementLabel[record.placement]}`
    case "change":
      return `${record.amount.toLocaleString()}원 · ${record.coins.join("·")}원`
    case "sort":
      return `${record.n}장 · ${sortOrderLabel[record.order]}`
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
      return `가장 많이 걸려도 ${lockLimit(record.digits).toLocaleString()}회`
    case "change":
      return record.optimalCount === null
        ? "만들 수 있는 답 없음"
        : `가장 적은 개수 ${record.optimalCount}개`
    case "sort":
      return `가장 많이 걸려도 ${mergeSortComparisonLimit(record.n)}회`
  }
}

const columns: readonly RecordColumn<Experiment>[] = [
  { header: "전략", cell: record => strategyNames[record.strategy].title },
  { header: "문제", cell: problem },
  { header: "실험 결과", cell: result },
  { header: "비교 기준", cell: comparison },
]

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
    <RecordTable
      records={records}
      remove={remove}
      clear={clear}
      columns={columns}
      caption="완료된 문제 해결 전략 실험 기록"
      note="숨겨진 값은 실험을 끝낸 뒤에만 기록됩니다."
      empty="세 전략 중 하나를 끝까지 실행하면 여기에 기록이 쌓입니다."
      deleteLabel={record => `${strategyNames[record.strategy].title} ${problem(record)} 기록 삭제`}
    />
  )
}
