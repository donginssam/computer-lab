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
import { binaryUpperBound, divideMax, sequentialMax } from "../engine/theory"
import type { Experiment } from "../state/records"
const theory = Array.from({ length: 99 }, (_, i) => ({
  n: i + 2,
  sequential: sequentialMax(i + 2),
  divide: divideMax(i + 2),
  upper: binaryUpperBound(i + 2),
}))
export function ComplexityChart({ records }: { records: Experiment[] }) {
  return (
    <section className="sim-card">
      <h2>상자가 늘어나면 비교 횟수는?</h2>
      <p className="small-note">
        가로축: 상자 수 N · 세로축: 저울질 횟수. 점은 실제 실험이며 위 표에서도 확인할 수 있습니다.
      </p>
      <ul className="chart-legend">
        <li>🔵 파랑 실선: 순차 ⌊N/2⌋ / ● 실험</li>
        <li>🟠 주황 파선: 절반 ⌊log₂N⌋ / ◆ 실험</li>
        <li>회색 점선: 느슨한 상한 ⌈log₂N⌉</li>
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
              name="순차 이론 최대"
              stroke="#245bc0"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="divide"
              name="절반 이론 최대"
              stroke="#b54a0b"
              strokeDasharray="7 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="upper"
              name="절반 상한 (올림)"
              stroke="#687386"
              strokeDasharray="2 4"
              dot={false}
              isAnimationActive={false}
            />
            <Scatter
              name="순차 실험"
              dataKey="comparisons"
              data={records.filter(r => r.algorithm === "sequential-pair")}
              fill="#245bc0"
              isAnimationActive={false}
            />
            <Scatter
              name="절반 실험"
              dataKey="comparisons"
              data={records.filter(r => r.algorithm === "divide-half")}
              fill="#b54a0b"
              shape="diamond"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="small-note">
        절반씩 나누기의 정확한 최악 횟수는 내림값입니다. 예: N=7이면 7 → 3 → 1로 2회입니다.
      </p>
    </section>
  )
}
