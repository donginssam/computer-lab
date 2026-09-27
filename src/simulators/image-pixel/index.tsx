import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { oneOfParam } from "../shared/params"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { imageCopy, tabIds, tabs } from "./copy"
import { parseHex, type Depth } from "./engine"
import { MixColor } from "./MixColor"
import { PixelCanvas } from "./PixelCanvas"
import "./simulator.css"

const depths: readonly Depth[] = ["color", "bw"]

export function ImagePixelPage() {
  const unit = unitById("data")!
  const [params, setParams] = useSearchParams()
  const tab = oneOfParam(params.get("tab"), tabIds, "mix")
  // 데이터 단원 색(#2B6BE6)에서 시작한다.
  const color = parseHex(params.get("c")) ?? { r: 43, g: 107, b: 230 }
  const depth = oneOfParam(params.get("depth"), depths, "color")

  const change = useCallback(
    (updates: Record<string, string>, replace = true) => {
      setParams(
        current => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(updates)) next.set(key, value)
          return next
        },
        { replace },
      )
    },
    [setParams],
  )

  return (
    <div className="sim-page image-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="image-pixel">
        {imageCopy.lead}
      </SimulatorHeader>
      <TabList
        items={tabs}
        current={tab}
        idPrefix="image-tab-"
        panelId="image-panel"
        label="그림 표현 실험"
        change={next => change({ tab: next }, false)}
      />
      <section id="image-panel" role="tabpanel" aria-labelledby={`image-tab-${tab}`} tabIndex={0}>
        {tab === "mix" && <MixColor color={color} change={change} />}
        {tab === "pixels" && <PixelCanvas mixed={color} depth={depth} change={change} />}
      </section>
      <p className="small-note">{imageCopy.hiddenSetting}</p>
    </div>
  )
}
