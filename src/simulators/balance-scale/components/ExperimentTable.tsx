import { RecordTable, type RecordColumn } from "../../shared/RecordTable"
import { algorithms } from "../engine"
import type { Experiment } from "../state/records"

const columns: readonly RecordColumn<Experiment>[] = [
  { header: "동전 수", cell: r => r.n },
  { header: "알고리즘", cell: r => algorithms[r.algorithm].name },
  {
    header: "가짜 동전 위치",
    cell: r =>
      `${r.fakePlacement === "worst" ? "가장 늦게 찾는 곳" : "무작위"} · ${r.fakeIndex + 1}번`,
  },
  { header: "실제 저울질", cell: r => `${r.comparisons}회` },
  { header: "가장 많이 걸려도", cell: r => `${algorithms[r.algorithm].maxComparisons(r.n)}회` },
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
      caption="완료된 알고리즘별 저울질 횟수"
      note="가짜 동전이 어디였는지는 실험이 끝난 뒤에 보여 줍니다."
      empty="시뮬레이션이나 나란히 비교를 끝내면 기록이 쌓입니다. 동전 8개, 16개, 32개, 64개로 실험해 보세요."
      deleteLabel={r =>
        `동전 ${r.n}개 ${algorithms[r.algorithm].name} 저울질 ${r.comparisons}회 기록 삭제`
      }
    />
  )
}
