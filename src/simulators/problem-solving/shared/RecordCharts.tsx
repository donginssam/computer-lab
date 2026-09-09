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
import { mergeSortComparisonLimit } from "../sort/engine"
import type { Experiment } from "./records"

export function RecordCharts({ records }: { records: Experiment[] }) {
  const lock = records.filter(record => record.strategy === "lock")
  const change = records.filter(record => record.strategy === "change")
  const sort = records.filter(record => record.strategy === "sort")
  const lockLimit = [1, 2, 3, 4].map(digits => ({ digits, limit: 10 ** digits }))
  const sortLimit = Array.from({ length: 15 }, (_, index) => {
    const n = index + 2
    return { n, limit: mergeSortComparisonLimit(n) }
  })

  return (
    <section className="ps-record-charts" aria-labelledby="record-chart-title">
      <h2 id="record-chart-title">결과를 그래프로 비교해 보세요</h2>
      <div className="ps-chart-grid">
        <article className="sim-card">
          <h3>자물쇠: 자릿수와 시도</h3>
          <p className="small-note">선은 가장 많이 걸려도 필요한 횟수, 점은 내 실험입니다.</p>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={lockLimit} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="digits" type="number" domain={[1, 4]} ticks={[1, 2, 3, 4]} />
                <YAxis type="number" scale="log" domain={[1, 10000]} />
                <Tooltip />
                <Line
                  dataKey="limit"
                  name="가장 많이 걸려도"
                  stroke="#b4233b"
                  dot={false}
                  isAnimationActive={false}
                />
                <Scatter
                  name="내 실험"
                  data={lock}
                  dataKey="attempts"
                  fill="#b4233b"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="sim-card">
          <h3>거스름돈: 고른 개수</h3>
          <p className="small-note">같은 금액에서 욕심쟁이 결과와 가장 적은 개수를 비교합니다.</p>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="amount" type="number" name="금액" unit="원" />
                <YAxis type="number" allowDecimals={false} />
                <Tooltip />
                <Scatter
                  name="욕심쟁이"
                  data={change}
                  dataKey="greedyCount"
                  fill="#b46b00"
                  isAnimationActive={false}
                />
                <Scatter
                  name="가장 적은 개수"
                  data={change}
                  dataKey="optimalCount"
                  fill="#245bc0"
                  shape="diamond"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="sim-card">
          <h3>카드 정리: 비교 횟수</h3>
          <p className="small-note">선은 가장 많이 비교하는 횟수, 점은 내 실험입니다.</p>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={sortLimit} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="n" type="number" domain={[2, 16]} allowDecimals={false} />
                <YAxis type="number" allowDecimals={false} />
                <Tooltip />
                <Line
                  dataKey="limit"
                  name="가장 많이 걸려도"
                  stroke="#6a3cc7"
                  dot={false}
                  isAnimationActive={false}
                />
                <Scatter
                  name="내 실험"
                  data={sort}
                  dataKey="comparisons"
                  fill="#6a3cc7"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  )
}
