import { clampInteger } from "../../shared/params"
import type { StepEngine } from "../shared/stepper"
import { createAllCardsTrace } from "./selection"

export const EXAM_DEFAULT = 30
export const EXAM_MIN = 2
export const EXAM_MAX = 30
export const examOrders = ["random", "reverse", "manual"] as const
export type ExamOrder = (typeof examOrders)[number]
export const examOrderLabels: Record<ExamOrder, string> = {
  random: "무작위",
  reverse: "거꾸로",
  manual: "직접 입력",
}
export const examInputExample = (n: number) => Array.from({ length: n }, (_, i) => n - i).join("-")
export const clampExamCount = (n: number) => clampInteger(n, EXAM_MIN, EXAM_MAX)

export function parseExamInput(input: string, n: number) {
  const values = /^\s*\d+(?:\s*-\s*\d+)+\s*$/.test(input)
    ? input.split("-").map(value => Number(value.trim()))
    : []
  if (
    values.length !== n ||
    new Set(values).size !== n ||
    !values.every(value => Number.isInteger(value) && value >= 1 && value <= n)
  )
    throw new RangeError(`1~${n}번을 빠짐없이, 중복 없이 입력해 주세요. 예: ${examInputExample(n)}`)
  return values
}

export interface ExamOptions {
  n: number
  order: ExamOrder
  papers?: number[]
}
export interface ExamGroup {
  first: number
  last: number
  remaining: number[]
  output: number[]
  comparisons: number
  finished: boolean
}
export const groupLabel = (group: ExamGroup) => `${group.first}~${group.last}번`
export const comparisonCount = (n: number) => (n * (n - 1)) / 2
export const divideComparisonCount = (n: number) =>
  Array.from({ length: Math.ceil(n / 10) }, (_, i) =>
    comparisonCount(Math.min(10, n - i * 10)),
  ).reduce((sum, value) => sum + value, 0)

function emptyGroups(n: number): ExamGroup[] {
  return Array.from({ length: Math.ceil(n / 10) }, (_, i) => ({
    first: i * 10 + 1,
    last: Math.min(n, i * 10 + 10),
    remaining: [],
    output: [],
    comparisons: 0,
    finished: false,
  }))
}

export function makeExamPapers(options: ExamOptions, seed: number) {
  const { n, order, papers } = options
  if (!Number.isInteger(n) || n < EXAM_MIN || n > EXAM_MAX)
    throw new RangeError("시험지는 2~30장이어야 합니다.")
  if (order === "manual" && papers) return parseExamInput(papers.join("-"), n)
  const result = Array.from({ length: n }, (_, i) => i + 1)
  if (order === "reverse") return result.reverse()
  let value = seed >>> 0 || 1
  for (let i = n - 1; i > 0; i--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    const j = value % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export interface ExamDivideStep {
  kind: "divide" | "compare" | "place" | "combine"
  groups: ExamGroup[]
  comparisons: number
  groupIndex?: number
  active?: number[]
  candidate?: number
  message: string
}
export interface ExamDivideState {
  papers: number[]
  groups: ExamGroup[]
  trace: ExamDivideStep[]
  index: number
  comparisons: number
  finished: boolean
}

export function createExamDivideTrace(papers: readonly number[]) {
  const groups = emptyGroups(papers.length)
  const trace: ExamDivideStep[] = []
  let comparisons = 0
  const push = (step: Omit<ExamDivideStep, "groups" | "comparisons">) =>
    trace.push({
      ...step,
      comparisons,
      groups: groups.map(group => ({
        ...group,
        remaining: [...group.remaining],
        output: [...group.output],
      })),
    })
  // 번호의 범위만 확인하는 분류다. 시험지 두 장의 번호를 비교하지 않는다.
  for (const paper of papers) groups[Math.floor((paper - 1) / 10)].remaining.push(paper)
  push({
    kind: "divide",
    message: `① 나누기 · 번호를 보고 ${groups.map(groupLabel).join(", ")} 묶음에 놓았습니다. 시험지끼리의 비교는 0회입니다.`,
  })
  for (const [groupIndex, group] of groups.entries()) {
    const { trace: localTrace } = createAllCardsTrace(group.remaining)
    for (const step of localTrace) {
      group.remaining = [...step.remaining]
      group.output = [...step.output]
      group.finished = !step.remaining.length
      if (step.kind === "compare") {
        comparisons++
        group.comparisons++
      }
      push({
        kind: step.kind,
        groupIndex,
        active: step.compared ? [...step.compared] : undefined,
        candidate: step.candidate,
        message:
          step.kind === "compare"
            ? `② 묶음마다 정리 · ${groupLabel(group)} 묶음에서 ${step.compared![0]}번과 ${step.compared![1]}번을 비교합니다. 지금까지 가장 작은 번호는 ${step.candidate}번입니다.`
            : `② 묶음마다 정리 · ${step.candidate}번 시험지를 정리한 줄에 놓았습니다.${group.finished ? ` ${groupLabel(group)} 묶음 정리 완료!` : " 남은 시험지에서 다시 가장 작은 번호를 찾습니다."}`,
      })
    }
  }
  push({
    kind: "combine",
    message: `③ 합치기 · ${groups.map(groupLabel).join(" → ")} 묶음을 이어 붙였습니다. 번호 범위가 겹치지 않으므로 추가 비교는 0회입니다.`,
  })
  return trace
}

export const examDivideEngine: StepEngine<readonly number[], ExamDivideState> = {
  init(papers) {
    return {
      papers: [...papers],
      groups: emptyGroups(papers.length),
      trace: createExamDivideTrace(papers),
      index: 0,
      comparisons: 0,
      finished: false,
    }
  },
  step(state) {
    if (state.finished) return state
    const current = state.trace[state.index]
    const index = state.index + 1
    return {
      ...state,
      index,
      groups: current.groups,
      comparisons: current.comparisons,
      finished: index === state.trace.length,
    }
  },
  back(state) {
    if (!state.index) return state
    const index = state.index - 1
    const previous = state.trace[index - 1]
    return {
      ...state,
      index,
      groups: previous?.groups ?? emptyGroups(state.papers.length),
      comparisons: previous?.comparisons ?? 0,
      finished: false,
    }
  },
  isFinished: state => state.finished,
}

export const examEngine: StepEngine<ExamOptions, ExamDivideState> = {
  init(options, seed) {
    return examDivideEngine.init(makeExamPapers(options, seed), seed)
  },
  step: examDivideEngine.step,
  back: examDivideEngine.back,
  isFinished: examDivideEngine.isFinished,
}
