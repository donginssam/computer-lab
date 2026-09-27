import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { clampedParam, clampInteger, oneOfParam } from "../shared/params"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { TabList } from "../shared/TabList"
import { binaryCopy, tabIds, tabs } from "./copy"
import { DivideByTwo } from "./DivideByTwo"
import { UNSIGNED_MAX } from "./engine"
import { PlaceValueCards } from "./PlaceValueCards"
import "./simulator.css"

export function BinaryNumberPage() {
  const unit = unitById("data")!
  const [params, setParams] = useSearchParams()
  const tab = oneOfParam(params.get("tab"), tabIds, "cards")
  const target = clampedParam(params.get("n"), 13, value => clampInteger(value, 0, UNSIGNED_MAX))
  const dividend = clampedParam(params.get("d"), 13, value => clampInteger(value, 1, UNSIGNED_MAX))

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
    <div className="sim-page binary-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="binary-number">
        {binaryCopy.lead}
      </SimulatorHeader>
      <TabList
        items={tabs}
        current={tab}
        idPrefix="binary-tab-"
        panelId="binary-panel"
        label="이진수 실험"
        change={next => change({ tab: next }, false)}
      />
      <section id="binary-panel" role="tabpanel" aria-labelledby={`binary-tab-${tab}`} tabIndex={0}>
        {tab === "cards" && <PlaceValueCards target={target} change={change} />}
        {tab === "divide" && (
          <DivideByTwo
            number={dividend}
            change={change}
            openCards={next => change({ tab: "cards", n: String(next) }, false)}
          />
        )}
      </section>
      <p className="small-note binary-share-note">{binaryCopy.hiddenSetting}</p>
    </div>
  )
}
