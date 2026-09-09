import { useEffect, useRef } from "react"
import { useLocation, useNavigationType } from "react-router"

const POSITIONS = "computer-lab.scroll.v1"

function readPositions(): Record<string, number> {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(POSITIONS) ?? "{}")
    return value && typeof value === "object" ? (value as Record<string, number>) : {}
  } catch {
    return {}
  }
}

/**
 * 데이터 라우터의 ScrollRestoration을 대신한다. 새 화면으로 가면 맨 위로
 * 올리고, 뒤로 가기(POP)로 돌아오면 떠날 때 위치를 되돌린다.
 */
export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousKey = useRef(location.key)

  useEffect(() => {
    const leaving = previousKey.current
    previousKey.current = location.key
    try {
      sessionStorage.setItem(
        POSITIONS,
        JSON.stringify({ ...readPositions(), [leaving]: window.scrollY }),
      )
    } catch {
      // 저장할 수 없으면 위치 복원만 포기하고 이동은 그대로 진행한다.
    }
    const saved = navigationType === "POP" ? readPositions()[location.key] : undefined
    window.scrollTo(0, saved ?? 0)
  }, [location.key, navigationType])
}
