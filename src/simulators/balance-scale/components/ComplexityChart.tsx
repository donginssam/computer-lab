import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { divideMax, sequentialMax } from "../engine/theory"
import { algorithms } from "../engine"
import type { Experiment } from "../state/records"
const sequential = algorithms["sequential-pair"]
const divide = algorithms["divide-half"]
const theory = Array.from({ length: 99 }, (_, i) => ({
  n: i + 2,
  sequential: sequentialMax(i + 2),
  divide: divideMax(i + 2),
}))
export function ComplexityChart({ records }: { records: Experiment[] }) {
  return (
    <section className="sim-card">
      <h2>동전이 늘어나면 저울질은 몇 번으로 늘어날까?</h2>
      <p className="small-note">
        가로축은 동전 수, 세로축은 저울질 횟수입니다. 선은 가장 많이 걸려도 이 정도라는 뜻이고, 점은
        위 표에 있는 내 실험 결과입니다.
      </p>
      <ul className="chart-legend">
        <li>🔵 파랑 실선 — {sequential.name}: 동전 수의 절반만큼 저울질합니다 (● 내 실험)</li>
        <li>
          🟠 주황 점선 — {divide.name}: 동전이 2배가 될 때마다 저울질이 1번씩만 늘어납니다 (◆ 내
          실험)
        </li>
      </ul>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={theory}
            margin={{ top: 12, right: 16, bottom: 20, left: -20 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="n" domain={[2, 100]} ticks={[2, 16, 32, 64, 100]} />
            <YAxis type="number" domain={[0, 50]} allowDecimals={false} />
            <Tooltip />
            <Line
              dataKey="sequential"
              name={sequential.name}
              stroke="#245bc0"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="divide"
              name={divide.name}
              stroke="#b54a0b"
              strokeDasharray="7 4"
              dot={false}
              isAnimationActive={false}
            />
            <Scatter
              name={`${sequential.shortName} 내 실험`}
              dataKey="comparisons"
              data={records.filter(r => r.algorithm === "sequential-pair")}
              fill="#245bc0"
              isAnimationActive={false}
            />
            <Scatter
              name={`${divide.shortName} 내 실험`}
              dataKey="comparisons"
              data={records.filter(r => r.algorithm === "divide-half")}
              fill="#b54a0b"
              shape="diamond"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
