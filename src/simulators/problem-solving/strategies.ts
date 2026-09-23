export const strategyIds = ["lock", "change", "sort", "records"] as const

export type StrategyId = (typeof strategyIds)[number]
export type ExperimentStrategy = Exclude<StrategyId, "records">

export interface StrategyTab {
  id: StrategyId
  title: string
  longTitle: string
}

/**
 * 전략 이름은 여기에만 둔다. 탭과 기록 표는 짧은 이름(title)을, 실험 장면의
 * 제목은 정식 이름(longTitle)을 쓴다. 전략이 늘면 타입 검사가 빠진 이름을 잡는다.
 */
export const strategyNames: Readonly<Record<StrategyId, Omit<StrategyTab, "id">>> = {
  lock: { title: "시행착오", longTitle: "시행착오 방법" },
  change: { title: "욕심쟁이", longTitle: "욕심쟁이 방법" },
  sort: { title: "나누어 해결하기", longTitle: "작은 문제로 나누어 해결하기" },
  records: { title: "실험 기록", longTitle: "실험 기록" },
}

export const strategies: readonly StrategyTab[] = strategyIds.map(id => ({
  id,
  ...strategyNames[id],
}))

export function isStrategyId(value: string | null): value is StrategyId {
  return strategyIds.includes(value as StrategyId)
}
