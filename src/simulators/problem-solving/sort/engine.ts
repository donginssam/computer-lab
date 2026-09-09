import { CARD_MAX, CARD_MIN } from "../bounds"
import type { StepEngine } from "../shared/stepper"

export type SortOrder = "random" | "worst" | "reverse" | "manual"
export const sortOrders: readonly SortOrder[] = ["random", "worst", "reverse", "manual"]
export type SortRange = [start: number, end: number]

interface SortStepBase {
  range: SortRange
  depth: number
}

export type SortStep =
  | (SortStepBase & {
      kind: "split"
      values: number[]
      left: number[]
      right: number[]
    })
  | (SortStepBase & {
      kind: "compare"
      left: number
      right: number
      take: "left" | "right"
      output: number[]
      remainingLeft: number[]
      remainingRight: number[]
    })
  | (SortStepBase & {
      kind: "place"
      value: number
      from: "left" | "right"
      output: number[]
      remainingLeft: number[]
      remainingRight: number[]
    })
  | (SortStepBase & {
      kind: "merged"
      values: number[]
    })

export interface SortOptions {
  n: number
  order: SortOrder
  cards?: number[]
}

export interface SortState {
  cards: number[]
  trace: SortStep[]
  index: number
  comparisons: number
  finished: boolean
}

export const mergeSortComparisonLimit = (n: number) => {
  const height = Math.ceil(Math.log2(n))
  return n * height - 2 ** height + 1
}

export function worstCaseOrder(n: number) {
  if (!Number.isInteger(n) || n < CARD_MIN || n > CARD_MAX)
    throw new RangeError(`카드 수는 ${CARD_MIN}~${CARD_MAX}이어야 합니다.`)
  const arrange = (values: number[]): number[] => {
    if (values.length <= 1) return values
    const leftParity = values.length % 2 === 0 ? 0 : 1
    const left = values.filter((_, index) => index % 2 === leftParity)
    const right = values.filter((_, index) => index % 2 !== leftParity)
    return [...arrange(left), ...arrange(right)]
  }
  return arrange(Array.from({ length: n }, (_, index) => n - index))
}

function shuffledCards(n: number, seed: number) {
  const cards = Array.from({ length: n }, (_, index) => index + 1)
  let value = seed >>> 0 || 1
  for (let index = cards.length - 1; index > 0; index -= 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    const target = value % (index + 1)
    ;[cards[index], cards[target]] = [cards[target], cards[index]]
  }
  return cards
}

export function parseCardInput(input: string, n: number) {
  if (!/^\s*\d+(?:\s*-\s*\d+)+\s*$/.test(input))
    throw new RangeError("예: 35-12-90-7처럼 입력해 주세요.")
  const cards = input.split("-").map(value => Number(value.trim()))
  if (
    cards.length !== n ||
    new Set(cards).size !== cards.length ||
    cards.some(value => !Number.isInteger(value) || value < 1 || value > 99)
  )
    throw new RangeError(`1~99 사이의 서로 다른 숫자 ${n}개를 입력해 주세요.`)
  return cards
}

function makeCards(options: SortOptions, seed: number) {
  if (!Number.isInteger(options.n) || options.n < 2 || options.n > 16)
    throw new RangeError("카드 수는 2~16이어야 합니다.")
  if (options.order === "worst") return worstCaseOrder(options.n)
  if (options.order === "reverse")
    return Array.from({ length: options.n }, (_, index) => options.n - index)
  if (options.order === "manual" && options.cards) {
    const cards = [...options.cards]
    if (
      cards.length === options.n &&
      new Set(cards).size === cards.length &&
      cards.every(value => Number.isInteger(value) && value >= 1 && value <= 99)
    )
      return cards
  }
  return shuffledCards(options.n, seed)
}

export function createSortTrace(cards: readonly number[]) {
  const trace: SortStep[] = []
  const sort = (values: number[], start: number, depth: number): number[] => {
    if (values.length <= 1) return values
    const midpoint = Math.floor(values.length / 2)
    const leftInput = values.slice(0, midpoint)
    const rightInput = values.slice(midpoint)
    const range: SortRange = [start, start + values.length]
    trace.push({
      kind: "split",
      range,
      depth,
      values: [...values],
      left: [...leftInput],
      right: [...rightInput],
    })
    const left = sort(leftInput, start, depth + 1)
    const right = sort(rightInput, start + midpoint, depth + 1)
    const remainingLeft = [...left]
    const remainingRight = [...right]
    const output: number[] = []
    while (remainingLeft.length && remainingRight.length) {
      const take = remainingLeft[0] <= remainingRight[0] ? "left" : "right"
      const leftValue = remainingLeft[0]
      const rightValue = remainingRight[0]
      const value = take === "left" ? remainingLeft.shift()! : remainingRight.shift()!
      output.push(value)
      trace.push({
        kind: "compare",
        range,
        depth,
        left: leftValue,
        right: rightValue,
        take,
        output: [...output],
        remainingLeft: [...remainingLeft],
        remainingRight: [...remainingRight],
      })
    }
    while (remainingLeft.length) {
      const value = remainingLeft.shift()!
      output.push(value)
      trace.push({
        kind: "place",
        range,
        depth,
        value,
        from: "left",
        output: [...output],
        remainingLeft: [...remainingLeft],
        remainingRight: [...remainingRight],
      })
    }
    while (remainingRight.length) {
      const value = remainingRight.shift()!
      output.push(value)
      trace.push({
        kind: "place",
        range,
        depth,
        value,
        from: "right",
        output: [...output],
        remainingLeft: [...remainingLeft],
        remainingRight: [...remainingRight],
      })
    }
    trace.push({ kind: "merged", range, depth, values: [...output] })
    return output
  }
  const sorted = sort([...cards], 0, 0)
  return { trace, sorted }
}

export const sortEngine: StepEngine<SortOptions, SortState> = {
  id: "sort",
  name: "작은 문제로 나누어 해결하기",
  init(options, seed) {
    const cards = makeCards(options, seed)
    const { trace } = createSortTrace(cards)
    return { cards, trace, index: 0, comparisons: 0, finished: false }
  },
  step(state) {
    if (state.finished) return state
    const current = state.trace[state.index]
    const index = state.index + 1
    return {
      ...state,
      index,
      comparisons: state.comparisons + (current.kind === "compare" ? 1 : 0),
      finished: index >= state.trace.length,
    }
  },
  back(state) {
    if (!state.index) return state
    const previous = state.trace[state.index - 1]
    const index = state.index - 1
    return {
      ...state,
      index,
      comparisons: state.comparisons - (previous.kind === "compare" ? 1 : 0),
      finished: false,
    }
  },
  isFinished: state => state.finished,
}

export function sortStepText(step: SortStep) {
  switch (step.kind) {
    case "split":
      return `[${step.values.join(", ")}]을 [${step.left.join(", ")}]과 [${step.right.join(", ")}]으로 나눕니다.`
    case "compare":
      return `${step.left}와 ${step.right}을 비교해 더 작은 ${step.take === "left" ? step.left : step.right}을 옮깁니다.`
    case "place":
      return `한쪽 묶음이 비어 ${step.value}을 비교 없이 옮깁니다.`
    case "merged":
      return `[${step.values.join(", ")}]으로 합쳤습니다.`
  }
}
