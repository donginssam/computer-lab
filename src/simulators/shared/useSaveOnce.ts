import { useEffect, useRef } from "react"

/**
 * 완료된 실험을 실험당 한 번만 저장한다. 되감기로 완료 상태를 다시 지나가도
 * 같은 id가 두 번 쌓이지 않는다. pending은 렌더마다 새로 만들어도 되고,
 * 이미 저장한 id는 아래에서 걸러 낸다.
 */
export function useSaveOnce<T extends { id: string }>(save: (records: T[]) => void, pending: T[]) {
  const saved = useRef(new Set<string>())
  useEffect(() => {
    const additions = pending.filter(record => !saved.current.has(record.id))
    if (!additions.length) return
    for (const record of additions) saved.current.add(record.id)
    save(additions)
  })
}
