import type { LockPlacement } from "./bounds"
import type { SortOrder } from "./sort/engine"

export const problemSolvingCopy = {
  lead: "문제에 어울리는 해결 전략을 고르면 과정과 결과가 어떻게 달라지는지 실험해 보세요.",
  hiddenSetting: "직접 입력한 값과 무작위 결과, 진행 단계는 주소에 저장되지 않습니다.",
} as const

/** 설정 패널의 선택지와 기록 표가 같은 말을 쓴다. */
export const lockPlacementLabel: Record<LockPlacement, string> = {
  worst: "가장 늦게 찾는 곳",
  random: "무작위",
  manual: "직접 입력",
}

export const sortOrderLabel: Record<SortOrder, string> = {
  random: "무작위",
  worst: "가장 많이 비교하는 순서",
  reverse: "거꾸로",
  manual: "직접 입력",
}
