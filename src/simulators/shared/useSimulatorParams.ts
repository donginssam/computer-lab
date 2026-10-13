import { useCallback } from "react"
import { useSearchParams } from "react-router"

/** null은 삭제를 뜻한다. 관련 변경은 한 번에 전달해 한 번만 이동한다. */
export type ChangeParams = (updates: Record<string, string | null>, replace?: boolean) => void

/** 설정 변경은 현재 이력을 대체하고, 탭 이동은 replace=false로 이력을 남긴다. */
export function useSimulatorParams() {
  const [params, setParams] = useSearchParams()
  const change = useCallback<ChangeParams>(
    (updates, replace = true) => {
      setParams(
        current => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(updates)) {
            if (value === null) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace },
      )
    },
    [setParams],
  )
  return { params, change }
}
