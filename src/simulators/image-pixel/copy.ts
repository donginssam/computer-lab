import type { TabItem } from "../shared/TabList"
import type { Channel } from "./engine"

/**
 * 한 개념에는 한 말만 쓴다. 설정·장면·질문이 모두 이 이름을 가져다 쓴다.
 *
 * - 그림을 이루는 작은 네모 한 칸 → "픽셀"
 * - 빨강·초록·파랑 각각의 밝기 → "세기" (0~255)
 * - 픽셀 하나에 쓰는 비트 수 → "색 깊이"
 */
export type TabId = "mix" | "pixels"

export const tabs: readonly TabItem<TabId>[] = [
  { id: "mix", title: "RGB로 색 만들기" },
  { id: "pixels", title: "픽셀 그림" },
]

export const tabIds = tabs.map(tab => tab.id)

export const channelNames: Record<Channel, { name: string; letter: string }> = {
  r: { name: "빨강", letter: "R" },
  g: { name: "초록", letter: "G" },
  b: { name: "파랑", letter: "B" },
}

export const imageCopy = {
  lead: "화면의 그림은 아주 작은 점(픽셀)이 모인 것이고, 픽셀마다 빨강·초록·파랑 빛의 세기를 수로 저장합니다. 색을 섞어 16진수와 이진수로 적고, 그림 한 장이 몇 비트인지 계산해 보세요.",
  hiddenSetting:
    "지금 주소를 복사하면 탭, 만든 색, 색 깊이를 그대로 전달할 수 있습니다. 칠한 픽셀 그림은 전달되지 않습니다.",
} as const
