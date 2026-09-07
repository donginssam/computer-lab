import type { Options } from "../state/reducer"
import { algorithms } from "../engine"
export function ControlPanel({
  options,
  change,
  manual,
}: {
  options: Options
  change: (key: string, value: string) => void
  manual: boolean
}) {
  return (
    <section className="sim-card controls" aria-label="실험 설정">
      <label>
        상자 개수{" "}
        <input
          type="number"
          min={2}
          max={100}
          key={options.n}
          defaultValue={options.n}
          onBlur={e => {
            const value = String(
              Math.max(2, Math.min(100, Math.trunc(Number(e.target.value) || 7))),
            )
            e.currentTarget.value = value
            change("n", value)
          }}
          onKeyDown={e => {
            if (e.key === "Enter") e.currentTarget.blur()
          }}
        />
      </label>
      <label className="range-label">
        <span className="sr-only">상자 개수 슬라이더</span>
        <input
          type="range"
          min={2}
          max={100}
          value={options.n}
          onChange={e => change("n", e.target.value)}
        />
        <span>2~100개</span>
      </label>
      {!manual && (
        <>
          <label>
            알고리즘 / 최악 위치 기준{" "}
            <select value={options.algorithm} onChange={e => change("algorithm", e.target.value)}>
              {Object.values(algorithms).map(a => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            불량 위치{" "}
            <select value={options.placement} onChange={e => change("placement", e.target.value)}>
              <option value="worst">최악의 경우</option>
              <option value="random">무작위</option>
            </select>
          </label>
        </>
      )}
      <p className="small-note">
        설정을 바꾸면 새 실험이 시작됩니다.
        {manual ? " 직접 해보기의 정답은 항상 무작위입니다." : " 정답 위치는 완료 후 공개됩니다."}
      </p>
    </section>
  )
}
