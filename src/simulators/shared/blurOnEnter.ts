import type { KeyboardEvent } from "react"

/** 숫자·텍스트 입력은 blur에서 값을 확정한다. Enter도 같은 확정 경로를 타게 한다. */
export function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") event.currentTarget.blur()
}
