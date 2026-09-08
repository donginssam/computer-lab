export const modes = [
  { id: "simulation", title: "시뮬레이션" },
  { id: "compare", title: "나란히 비교" },
  { id: "records", title: "실험 기록" },
] as const

export type Mode = (typeof modes)[number]["id"]
