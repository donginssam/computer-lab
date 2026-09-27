import type { TabItem } from "../shared/TabList"

/**
 * 문자·그림·소리를 한 페이지에서 다룬다. 탭마다 쓰는 말은 text/·image/·sound/의 copy.ts 주석에
 * 한 벌씩 둔다. 주소 파라미터는 탭끼리 겹치지 않게 이름을 나눴다.
 *
 * - kind: 문자·그림·소리 탭 / view: 문자·그림 안의 보기
 * - 문자: t(입력 글자), code(비트로 만든 코드) / 그림: color, depth / 소리: wave, n, bits
 */
export type KindId = "text" | "image" | "sound"

export const kinds: readonly TabItem<KindId>[] = [
  { id: "text", title: "문자" },
  { id: "image", title: "그림" },
  { id: "sound", title: "소리" },
]

export const kindIds = kinds.map(kind => kind.id)

export const dataCopy = {
  lead: "컴퓨터는 글자도, 그림도, 소리도 0과 1로 저장합니다. 정보를 수로 약속하고 그 수를 이진수로 적는 과정을 세 가지 데이터로 차례로 따라가 보세요.",
  hiddenSetting:
    "지금 주소를 복사하면 탭과 설정(입력한 글자, 켜 둔 비트, 만든 색, 색 깊이, 소리 모양, 표본 수, 양자화 비트)을 그대로 전달할 수 있습니다. 칠한 픽셀 그림, 해독 문제, 진행 단계는 전달되지 않습니다.",
} as const

/** 주소의 여러 값을 한 번에 바꾼다. replace가 false면 뒤로 가기로 돌아올 수 있다. */
export type Change = (updates: Record<string, string>, replace?: boolean) => void
