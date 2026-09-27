import type { TabItem } from "../shared/TabList"

/**
 * 한 개념에는 한 말만 쓴다. 설정·장면·질문이 모두 이 이름을 가져다 쓴다.
 *
 * - 문자마다 정해 둔 번호 → "코드" (ASCII 코드, 유니코드 번호)
 * - 번호와 문자를 짝지은 약속 → "코드표"
 * - 8비트 묶음 → "바이트"
 */
export type TabId = "encode" | "decode"

export const tabs: readonly TabItem<TabId>[] = [
  { id: "encode", title: "문자 → 이진수" },
  { id: "decode", title: "이진수 → 문자" },
]

export const tabIds = tabs.map(tab => tab.id)

export const textCopy = {
  lead: "컴퓨터는 글자도 0과 1로 저장합니다. 글자마다 정해 둔 번호(코드)를 찾아 이진수로 바꾸고, 거꾸로 이진수를 읽어 글자를 찾아보세요.",
  hiddenSetting:
    "지금 주소를 복사하면 탭, 입력한 글자, 켜 둔 비트를 그대로 전달할 수 있습니다. 풀던 해독 문제는 전달되지 않습니다.",
} as const

/** 입력칸 옆에 두는 예시 */
export const samples = ["Hi!", "CAT", "Aa", "2026", "안녕"] as const
