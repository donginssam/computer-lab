import type { ReactNode } from "react"
import { MAX_RECORDS } from "./records"

export interface RecordColumn<T> {
  header: string
  cell: (record: T) => ReactNode
}

/**
 * 기록 표의 뼈대. 제목·전체 삭제·보관 안내·빈 상태·행별 삭제는 같고, 열과 문구만
 * 시뮬레이터가 정한다.
 */
export function RecordTable<T extends { id: string }>({
  records,
  remove,
  clear,
  columns,
  caption,
  note,
  empty,
  deleteLabel,
}: {
  records: readonly T[]
  remove: (id: string) => void
  clear: () => void
  columns: readonly RecordColumn<T>[]
  caption: string
  note: string
  empty: string
  deleteLabel: (record: T) => string
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
        이 컴퓨터의 이 브라우저에만 최근 {MAX_RECORDS}개가 남습니다. {note}
      </p>
      {!records.length ? (
        <p className="empty-state">{empty}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {columns.map(column => (
                  <th scope="col" key={column.header}>
                    {column.header}
                  </th>
                ))}
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  {columns.map(column => (
                    <td key={column.header}>{column.cell(record)}</td>
                  ))}
                  <td>
                    <button
                      type="button"
                      aria-label={deleteLabel(record)}
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
