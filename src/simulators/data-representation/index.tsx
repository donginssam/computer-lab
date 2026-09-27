import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { oneOfParam } from "../shared/params"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { dataCopy, kindIds, kinds, type Change } from "./copy"
import { ImagePanel } from "./image/ImagePanel"
import { SoundPanel } from "./sound/SoundPanel"
import { TextPanel } from "./text/TextPanel"
import "./simulator.css"

export function DataRepresentationPage() {
  const unit = unitById("data")!
  const [params, setParams] = useSearchParams()
  const kind = oneOfParam(params.get("kind"), kindIds, "text")

  const change = useCallback<Change>(
    (updates, replace = true) => {
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
    <div className="sim-page data-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="data-representation">
        {dataCopy.lead}
      </SimulatorHeader>
      <TabList
        items={kinds}
        current={kind}
        idPrefix="data-tab-"
        panelId="data-panel"
        label="데이터 종류"
        // 보기는 탭마다 다르므로 탭을 바꿀 때 지운다. 나머지 설정은 탭끼리 겹치지 않아 그대로 둔다.
        change={next =>
          setParams(
            current => {
              const updated = new URLSearchParams(current)
              updated.set("kind", next)
              updated.delete("view")
              return updated
            },
            { replace: false },
          )
        }
      />
      <section id="data-panel" role="tabpanel" aria-labelledby={`data-tab-${kind}`} tabIndex={0}>
        {kind === "text" && <TextPanel params={params} change={change} />}
        {kind === "image" && <ImagePanel params={params} change={change} />}
        {kind === "sound" && <SoundPanel params={params} change={change} />}
      </section>
      <p className="small-note">{dataCopy.hiddenSetting}</p>
    </div>
  )
}
