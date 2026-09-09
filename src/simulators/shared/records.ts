export const MAX_RECORDS = 500

export function mergeRecords<T extends { id: string }>(current: T[], additions: T[]): T[] {
  const ids = new Set(current.map(record => record.id))
  const unique = additions.filter(record => {
    if (ids.has(record.id)) return false
    ids.add(record.id)
    return true
  })
  return [...current, ...unique].slice(-MAX_RECORDS)
}

/** 저장값은 손으로도 고칠 수 있으므로, 형식 검사를 통과한 기록만 남긴다. */
export function readStoredRecords<T>(
  storageKey: string,
  isRecord: (value: unknown) => value is T,
): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
    return Array.isArray(value) ? value.filter(isRecord).slice(-MAX_RECORDS) : []
  } catch {
    return []
  }
}
