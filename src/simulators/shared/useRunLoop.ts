import { useEffect } from "react"

/** 입력 중에는 단축키가 끼어들면 안 되므로, 조작 가능한 요소 안에서 눌렀는지 본다. */
export function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        "input, select, textarea, button, a, summary, [contenteditable=true], [role=tab]",
      ),
    )
  )
}

export interface RunLoop {
  running: boolean
  speed: number
  tick: number
  done: boolean
  step: () => void
  reset: () => void
  toggle: () => void
}

/**
 * 두 시뮬레이터가 함께 쓰는 자동 실행 타이머와 단축키(Space/R/A)를 담당한다.
 * tick이 의존성에 있어야 한 단계가 끝날 때마다 다음 타이머가 다시 걸린다.
 */
export function useRunLoop({ running, speed, tick, done, step, reset, toggle }: RunLoop) {
  useEffect(() => {
    if (!running || done) return
    const timer = window.setTimeout(step, speed)
    return () => window.clearTimeout(timer)
  }, [running, speed, tick, done, step])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return
      if (isInteractiveTarget(event.target)) return
      if (event.code === "Space") {
        event.preventDefault()
        step()
      }
      if (event.key.toLowerCase() === "r") reset()
      if (event.key.toLowerCase() === "a" && !done) toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, reset, toggle, done])
}
