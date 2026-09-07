import type { Tilt } from "./engine/types"
export const resultLabel: Record<Tilt, string> = {
  left: "↖ 왼쪽이 가볍습니다",
  right: "↗ 오른쪽이 가볍습니다",
  balanced: "＝ 양쪽 무게가 같습니다",
}
export const boxList = (ids: number[]) => ids.map(id => id + 1).join("·")
