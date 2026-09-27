import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { clampedParam, clampInteger, oneOfParam } from "../shared/params"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { tabIds, tabs, textCopy } from "./copy"
import { DecodeBits } from "./DecodeBits"
import { BYTE_MAX } from "./engine"
import { EncodeText } from "./EncodeText"
import "./simulator.css"

export function TextEncodingPage() {
  const unit = unitById("data")!
  const [params, setParams] = useSearchParams()
  const tab = oneOfParam(params.get("tab"), tabIds, "encode")
  const text = params.get("t") ?? "Hi!"
  const code = clampedParam(params.get("c"), 65, value => clampInteger(value, 0, BYTE_MAX))

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
    <div className="sim-page text-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="text-encoding">
        {textCopy.lead}
      </SimulatorHeader>
      <TabList
        items={tabs}
        current={tab}
        idPrefix="text-tab-"
        panelId="text-panel"
        label="문자 표현 실험"
        change={next => change({ tab: next }, false)}
      />
      <section id="text-panel" role="tabpanel" aria-labelledby={`text-tab-${tab}`} tabIndex={0}>
        {tab === "encode" && <EncodeText value={text} change={change} />}
        {tab === "decode" && <DecodeBits code={code} change={change} />}
      </section>
      <p className="small-note">{textCopy.hiddenSetting}</p>
    </div>
  )
}
