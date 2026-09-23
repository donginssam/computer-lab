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
 * 데이터 라우터의 ScrollRestoration을 대신한다. 다른 화면으로 가면 맨 위로
 * 올리고, 뒤로 가기(POP)로 돌아오면 떠날 때 위치를 되돌린다.
 *
 * 경로는 그대로이고 주소의 ? 뒤만 바뀌는 이동(설정·모드 탭 변경)에서는 스크롤을
 * 건드리지 않는다. 데이터 라우터라면 그런 이동마다 preventScrollReset을 줘야
 * 하는 자리다. 이 경우에는 위치도 저장하지 않아서, 슬라이더를 끌 때마다 저장소가
 * 커지지 않는다.
 */
export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef({ key: location.key, pathname: location.pathname })

  useEffect(() => {
    const leaving = previous.current
    previous.current = { key: location.key, pathname: location.pathname }
    if (leaving.pathname === location.pathname) return
    try {
      sessionStorage.setItem(
        POSITIONS,
        JSON.stringify({ ...readPositions(), [leaving.key]: window.scrollY }),
      )
    } catch {
      // 저장할 수 없으면 위치 복원만 포기하고 이동은 그대로 진행한다.
    }
    const saved = navigationType === "POP" ? readPositions()[location.key] : undefined
    window.scrollTo(0, saved ?? 0)
  }, [location.key, location.pathname, navigationType])
}
