import { useCallback, useRef, useState } from "react"
import { mergeRecords, readRecords, STORAGE_KEY, type Experiment } from "./records"

export function useRecords() {
  const [records, setRecords] = useState(readRecords)
  const [storageError, setStorageError] = useState(false)
  const latest = useRef(records)

  const commit = useCallback((update: (current: Experiment[]) => Experiment[]) => {
    const next = update(latest.current)
    latest.current = next
    let failed = false
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      failed = true
    }
    setRecords(next)
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
