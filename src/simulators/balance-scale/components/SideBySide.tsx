import type { RunState } from "../state/reducer"
import { algorithms } from "../engine"
import { SimulationView } from "./SimulationView"
export function SideBySide({ state }: { state: RunState }) {
  const done = Object.values(state.pair).every(s => s.finished)
  return (
    <>
      <p className="small-note">
        두 알고리즘은 동전 수도, 가짜 동전의 자리도 똑같이 두고 실행합니다.
      </p>
      <div className="comparison-grid">
        <SimulationView state={state.pair["sequential-pair"]} algorithm="sequential-pair" />
        <SimulationView state={state.pair["divide-half"]} algorithm="divide-half" />
      </div>
      {done && (
        <p className="result" role="status">
          {algorithms["sequential-pair"].name}는 {state.pair["sequential-pair"].comparisons}회,{" "}
          {algorithms["divide-half"].name}는 {state.pair["divide-half"].comparisons}회.{" "}
          {state.options.n === 100
            ? "동전을 절반으로 줄이면 어떻게 될까요?"
            : "동전이 100개면 어떻게 달라질까요?"}
        </p>
      )}
    </>
  )
}
