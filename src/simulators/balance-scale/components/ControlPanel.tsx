import { blurOnEnter } from "../../shared/blurOnEnter"
import type { Options } from "../state/reducer"
import { algorithms } from "../engine"
import { clampCoinCount, COIN_MAX, COIN_MIN } from "../engine/core"
import { WORST_CASE_BASELINE } from "../state/useSimulation"
export function ControlPanel({
  options,
  change,
  compare,
}: {
  options: Options
  change: (key: string, value: string) => void
  compare: boolean
}) {
  // Side by side runs both algorithms and fixes the worst case to the
  // sequential scan, so there is nothing left for the picker to decide there.
  const worst = options.placement === "worst"
  const chosen = compare ? algorithms[WORST_CASE_BASELINE] : algorithms[options.algorithm]
  // 대비 문장은 기준이 아닌 쪽을 가리킨다. 기준이 바뀌어도 따라간다.
  const other = Object.values(algorithms).find(a => a.id !== chosen.id)
  return (
    <section className="sim-card controls" aria-label="실험 설정">
      <label>
        동전 수{" "}
        <input
          type="number"
          min={COIN_MIN}
          max={COIN_MAX}
          key={options.n}
          defaultValue={options.n}
          onBlur={e => {
            const value = String(clampCoinCount(e.target.value))
            e.currentTarget.value = value
            change("n", value)
          }}
          onKeyDown={blurOnEnter}
        />
      </label>
      <label className="range-label">
        <span className="sr-only">동전 수 슬라이더</span>
        <input
          type="range"
          min={COIN_MIN}
          max={COIN_MAX}
          value={options.n}
          onChange={e => change("n", e.target.value)}
        />
        <span>
          {COIN_MIN}~{COIN_MAX}개
        </span>
      </label>
      {!compare && (
        <label>
          알고리즘{" "}
          <select value={options.algorithm} onChange={e => change("algorithm", e.target.value)}>
            {Object.values(algorithms).map(a => (
              <option value={a.id} key={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        가짜 동전 위치{" "}
        <select value={options.placement} onChange={e => change("placement", e.target.value)}>
          <option value="worst">가장 늦게 찾는 곳</option>
          <option value="random">무작위</option>
        </select>
      </label>
      <p className="small-note">
        {worst &&
          `‘가장 늦게 찾는 곳’은 ${chosen.name}가 가짜 동전을 가장 늦게 찾게 되는 자리에 숨긴다는 뜻입니다. ` +
            `그래서 ${chosen.name}는 동전 ${options.n}개에서 가장 많이 걸려도 ${chosen.maxComparisons(options.n)}회인데, 이 자리에서는 그 ${chosen.maxComparisons(options.n)}회를 다 씁니다.` +
            (compare && other
              ? ` 같은 자리에서 ${other.name}는 ${other.maxComparisons(options.n)}회 안에 끝납니다. 어느 쪽이 유리한지 직접 확인해 보세요.`
              : "") +
            " "}
        설정을 바꾸면 새 실험이 시작되고, 가짜 동전이 어디였는지는 실험이 끝나면 알려 줍니다.
      </p>
    </section>
  )
}
