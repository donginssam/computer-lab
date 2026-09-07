import type { RunState } from "../state/reducer"
import { SimulationView } from "./SimulationView"
export function SideBySide({ state }: { state: RunState }) {
  const done = Object.values(state.pair).every(s => s.finished)
  return (
    <>
      <p className="small-note">
        두 알고리즘은 같은 상자 수와 같은 불량 위치로 실행합니다. ‘최악의 경우’는 위에서 선택한 기준
        알고리즘에 적용됩니다.
      </p>
      <div className="comparison-grid">
        <SimulationView state={state.pair["sequential-pair"]} algorithm="sequential-pair" />
        <SimulationView state={state.pair["divide-half"]} algorithm="divide-half" />
      </div>
      {done && (
        <p className="result" role="status">
          순차 비교는 {state.pair["sequential-pair"].comparisons}회, 절반씩 나누기는{" "}
          {state.pair["divide-half"].comparisons}회.{" "}
          {state.options.n === 100
            ? "상자를 절반으로 줄이면 어떻게 될까요?"
            : "N=100이면 어떻게 달라질까요?"}
        </p>
      )}
    </>
  )
}
