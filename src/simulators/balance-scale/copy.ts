import type { Tilt } from "./engine/types"

/**
 * One concept, one word. Every user-facing string in this simulator draws from
 * this list so a student can match the control they clicked to the sentence
 * they are reading.
 *
 * - the coin we are hunting for → "가짜 동전" (never 불량 · 정답)
 * - putting coins on the scale → "저울질" (never 비교, except inside an algorithm name)
 * - the two pans weighing equal → "양쪽이 같다" (never 균형)
 * - coins not yet ruled out → "후보", glossed once in the coin-grid legend
 */
export const term = {
  weighing: "저울질",
  candidate: "후보",
} as const

export const resultLabel: Record<Tilt, string> = {
  left: "↖ 왼쪽이 가볍습니다",
  right: "↗ 오른쪽이 가볍습니다",
  balanced: "= 양쪽 무게가 같습니다",
}

export const coinLabel = {
  answer: "찾은 가짜 동전",
  excluded: "아닌 것으로 확인됨",
  active: `저울 위 ${term.candidate}`,
  candidate: term.candidate,
} as const

export const coinList = (ids: number[]) => ids.map(id => id + 1).join("·")
