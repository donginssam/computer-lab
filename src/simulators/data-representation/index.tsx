import { useSimulatorParams } from "../shared/useSimulatorParams"
import { unitById, unitStyle } from "../../content/units"
import { oneOfParam } from "../shared/params"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { dataCopy, kindIds, kinds } from "./copy"
import { ImagePanel } from "./image/ImagePanel"
import { SoundPanel } from "./sound/SoundPanel"
import { TextPanel } from "./text/TextPanel"
import "./simulator.css"

export function DataRepresentationPage() {
  const unit = unitById("data")!
  const { params, change } = useSimulatorParams()
  const kind = oneOfParam(params.get("kind"), kindIds, "text")

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
        change={next => change({ kind: next, view: null }, false)}
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
