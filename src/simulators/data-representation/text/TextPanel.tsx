import { clampedParam, clampInteger, oneOfParam } from "../../shared/params"
import type { Change } from "../copy"
import { ViewSwitch } from "../ViewSwitch"
import { tabIds, tabs, textCopy } from "./copy"
import { DecodeBits } from "./DecodeBits"
import { BYTE_MAX } from "./engine"
import { EncodeText } from "./EncodeText"
import "./simulator.css"

export function TextPanel({ params, change }: { params: URLSearchParams; change: Change }) {
  const view = oneOfParam(params.get("view"), tabIds, "encode")
  const text = params.get("t") ?? "Hi!"
  const code = clampedParam(params.get("code"), 65, value => clampInteger(value, 0, BYTE_MAX))

  return (
    <div className="text-page">
      <p className="data-lead">{textCopy.lead}</p>
      <ViewSwitch
        items={tabs}
        current={view}
        label="문자 보기"
        change={next => change({ view: next }, false)}
      />
      {view === "encode" && <EncodeText value={text} change={change} />}
      {view === "decode" && <DecodeBits code={code} change={change} />}
    </div>
  )
}
