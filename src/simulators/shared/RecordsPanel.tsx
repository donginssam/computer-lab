import { Suspense, type ReactNode } from "react"

/**
 * 기록 탭. 저장 실패 안내, 기록 표, 지연 로딩 그래프를 같은 순서와 문구로 보여 준다.
 * 그래프 청크는 시뮬레이터마다 다르므로 chart로 받아 Suspense 안에 둔다.
 */
export function RecordsPanel({
  storageError,
  table,
  chart,
}: {
  storageError: boolean
  table: ReactNode
  chart: ReactNode
}) {
  return (
    <>
      {storageError && (
        <p className="sim-error" role="status">
          기록을 저장할 수 없어 이 화면을 벗어나면 현재 기록이 사라집니다.
        </p>
      )}
      {table}
      <Suspense fallback={<p>그래프를 불러오는 중…</p>}>{chart}</Suspense>
    </>
  )
}
