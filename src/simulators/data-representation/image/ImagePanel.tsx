import { oneOfParam } from "../../shared/params"
import type { Change } from "../copy"
import { ViewSwitch } from "../ViewSwitch"
import { imageCopy, tabIds, tabs } from "./copy"
import { parseHex, type Depth } from "./engine"
import { MixColor } from "./MixColor"
import { PixelCanvas } from "./PixelCanvas"
import "./simulator.css"

const depths: readonly Depth[] = ["color", "bw"]

export function ImagePanel({ params, change }: { params: URLSearchParams; change: Change }) {
  const view = oneOfParam(params.get("view"), tabIds, "mix")
  // 데이터 단원 색(#2B6BE6)에서 시작한다.
  const color = parseHex(params.get("color")) ?? { r: 43, g: 107, b: 230 }
  const depth = oneOfParam(params.get("depth"), depths, "color")

  return (
    <div className="image-page">
      <p className="data-lead">{imageCopy.lead}</p>
      <ViewSwitch
        items={tabs}
        current={view}
        label="그림 보기"
        change={next => change({ view: next }, false)}
      />
      {view === "mix" && <MixColor color={color} change={change} />}
      {view === "pixels" && <PixelCanvas mixed={color} depth={depth} change={change} />}
    </div>
  )
}
