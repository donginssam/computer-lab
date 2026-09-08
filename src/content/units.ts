import type { CSSProperties } from "react"

export type UnitId = "computing-system" | "data" | "algorithm" | "ai" | "digital-culture"

export type SimulatorStatus = "ready" | "in-progress" | "coming-soon"

export interface SimulatorMeta {
  slug: string
  title: string
  summary: string
  status: SimulatorStatus
}

export interface Unit {
  id: UnitId
  /** 교과서 단원 순서 */
  order: number
  title: string
  /** 단원 페이지 상단에 쓰는 한 문장 */
  lead: string
  /** 홈 타일에 쓰는 짧은 설명 */
  blurb: string
  color: string
  simulators: SimulatorMeta[]
}

export const units: Unit[] = [
  {
    id: "computing-system",
    order: 1,
    title: "컴퓨팅 시스템",
    lead: "컴퓨터 안에서 정보가 어떻게 전기 신호로 오가는지 들여다봅니다.",
    blurb: "하드웨어, 소프트웨어, 0과 1",
    color: "var(--color-unit-system)",
    simulators: [],
  },
  {
    id: "data",
    order: 2,
    title: "데이터",
    lead: "글자, 그림, 소리가 숫자로 바뀌고 다시 정보가 되는 과정을 다룹니다.",
    blurb: "표현, 압축, 시각화",
    color: "var(--color-unit-data)",
    simulators: [],
  },
  {
    id: "algorithm",
    order: 3,
    title: "알고리즘과 프로그래밍",
    lead: "같은 문제를 푸는 여러 방법을 만들고, 어느 쪽이 더 나은지 따져 봅니다.",
    blurb: "문제 해결 절차와 효율",
    color: "var(--color-unit-algo)",
    simulators: [
      {
        slug: "balance-scale",
        title: "양팔저울로 가짜 동전 찾기",
        summary:
          "진짜보다 가벼운 가짜 동전 하나를 찾을 때, 차례로 비교하기와 절반씩 나누기는 저울을 몇 번 쓸까요?",
        status: "ready",
      },
    ],
  },
  {
    id: "ai",
    order: 4,
    title: "인공지능",
    lead: "컴퓨터가 예시를 보고 규칙을 스스로 찾아내는 방법을 체험합니다.",
    blurb: "분류, 학습, 판단",
    color: "var(--color-unit-ai)",
    simulators: [],
  },
  {
    id: "digital-culture",
    order: 5,
    title: "디지털 문화",
    lead: "온라인에서 나와 다른 사람을 지키는 선택을 연습합니다.",
    blurb: "개인정보, 저작권, 디지털 발자국",
    color: "var(--color-unit-culture)",
    simulators: [],
  },
]

export const unitById = (id: string | undefined): Unit | undefined => units.find(u => u.id === id)

export const unitPath = (unit: Unit) => `/units/${unit.id}`

/** 단원 색을 --unit으로 넘긴다. 타일·카드·헤더·시뮬레이터가 같은 변수를 읽는다. */
export const unitStyle = (unit: Unit) => ({ "--unit": unit.color }) as CSSProperties

export const simulatorPath = (unit: Unit, sim: SimulatorMeta) => `${unitPath(unit)}/${sim.slug}`

export const statusLabel: Record<SimulatorStatus, string> = {
  ready: "해 보기",
  "in-progress": "만드는 중",
  "coming-soon": "준비 중",
}
