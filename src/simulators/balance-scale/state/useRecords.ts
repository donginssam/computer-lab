import { useCallback, useRef, useState } from "react"
import { mergeRecords, readRecords, STORAGE_KEY, type Experiment } from "./records"

/** Keep storage failures visible while allowing the current experiment to continue. */
export function useRecords() {
  const [records, setRecords] = useState(readRecords)
  const [storageError, setStorageError] = useState(false)
  // 콜백 안에서 최신 기록을 읽어야 저장 함수의 정체성이 기록마다 바뀌지 않는다.
  // records를 바꾸는 곳이 아래 commit 하나뿐이라서 이 ref와 state는 어긋나지 않는다.
  // 저장에 실패해도 둘은 함께 앞서 나가고, 다음 성공한 저장이 배열 전체를 다시 쓴다.
  const latest = useRef(records)

  // 저장은 기록을 바꾸는 순간에만 일어난다. 읽어 온 값을 마운트 때 그대로
  // 다시 쓰지 않으므로, 화면을 열기만 해서는 저장소를 건드리지 않는다.
  const commit = useCallback((next: (current: Experiment[]) => Experiment[]) => {
    const updated = next(latest.current)
    latest.current = updated
    let failed = false
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      failed = true
    }
    setRecords(updated)
    setStorageError(failed)
  }, [])

  const save = useCallback(
    (additions: Experiment[]) => commit(current => mergeRecords(current, additions)),
    [commit],
  )
  const remove = useCallback(
    (id: string) => commit(current => current.filter(record => record.id !== id)),
    [commit],
  )
  const clear = useCallback(() => commit(() => []), [commit])

  return { records, storageError, save, remove, clear }
}
