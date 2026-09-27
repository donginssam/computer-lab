import type { TabItem } from "../shared/TabList"

/**
 * 한 개념에는 한 말만 쓴다. 설정·장면·질문이 모두 이 이름을 가져다 쓴다.
 *
 * - 0이나 1이 들어가는 한 칸 → "비트" (자릿값 카드 탭에서 한 번 뜻을 설명)
 * - 카드가 앞면(수가 보임) → "켜기", 뒷면 → "끄기"
 */
export type TabId = "cards" | "divide"

export const tabs: readonly TabItem<TabId>[] = [
  { id: "cards", title: "자릿값 카드" },
  { id: "divide", title: "2로 나누기" },
]

export const tabIds = tabs.map(tab => tab.id)

export const binaryCopy = {
  lead: "컴퓨터는 모든 수를 0과 1로만 저장합니다. 자릿값 카드와 2로 나누기로 양의 정수를 이진수로 바꿔 보세요.",
  bitGloss: "0이나 1이 들어가는 한 칸을 비트라고 합니다. 이 실험은 8비트를 씁니다.",
  hiddenSetting:
    "지금 주소를 복사하면 탭과 입력한 수를 그대로 전달할 수 있습니다. 켜 둔 카드와 진행 단계는 전달되지 않습니다.",
} as const

/** 이진수를 읽기 쉽게 4비트마다 띄운다. */
export const spacedBits = (text: string) => text.replace(/(.{4})(?=.)/g, "$1 ")
