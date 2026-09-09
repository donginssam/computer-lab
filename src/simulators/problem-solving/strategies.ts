export const strategyIds = ["lock", "change", "sort", "records"] as const

export type StrategyId = (typeof strategyIds)[number]
export type ExperimentStrategy = Exclude<StrategyId, "records">

export interface StrategyTab {
  id: StrategyId
  title: string
  longTitle: string
}

export const strategies: readonly StrategyTab[] = [
  { id: "lock", title: "시행착오", longTitle: "시행착오 방법" },
  { id: "change", title: "욕심쟁이", longTitle: "욕심쟁이 방법" },
  { id: "sort", title: "나누어 해결하기", longTitle: "작은 문제로 나누어 해결하기" },
  { id: "records", title: "실험 기록", longTitle: "실험 기록" },
]

export function isStrategyId(value: string | null): value is StrategyId {
  return strategyIds.includes(value as StrategyId)
}
