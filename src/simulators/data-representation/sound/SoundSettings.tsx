import { NumberField } from "../../shared/NumberField"
import type { ChangeParams } from "../../shared/useSimulatorParams"
import {
  BITS_MAX,
  BITS_MIN,
  SAMPLES_MAX,
  SAMPLES_MIN,
  levelCount,
  waves,
  waveIds,
  type WaveId,
} from "./engine"

const bitChoices = Array.from({ length: BITS_MAX - BITS_MIN + 1 }, (_, i) => BITS_MIN + i)

export function SoundSettings({
  waveId,
  count,
  bits,
  change,
}: {
  waveId: WaveId
  count: number
  bits: number
  change: ChangeParams
}) {
  return (
    <section className="sim-card sim-settings sound-settings" aria-label="디지털 변환 설정">
      <div className="button-row" role="group" aria-label="소리 모양">
        {waveIds.map(id => (
          <button
            type="button"
            key={id}
            aria-pressed={id === waveId}
            onClick={() => change({ wave: id })}
          >
            {waves[id].name}
          </button>
        ))}
      </div>
      <NumberField
        label="표본 수"
        value={count}
        min={SAMPLES_MIN}
        max={SAMPLES_MAX}
        maxNote={`이 그래프에서는 ${SAMPLES_MAX}번까지 잴 수 있습니다.`}
        onCommit={next => change({ n: String(next) })}
      />
      <label className="sound-range">
        <span className="sr-only">표본 수 슬라이더</span>
        <input
          type="range"
          min={SAMPLES_MIN}
          max={SAMPLES_MAX}
          value={count}
          onChange={event => change({ n: event.target.value })}
        />
        <span className="small-note">
          {SAMPLES_MIN}~{SAMPLES_MAX}번
        </span>
      </label>
      <div className="button-row" role="group" aria-label="양자화 비트 수">
        <span className="sound-group-label">양자화 비트</span>
        {bitChoices.map(choice => (
          <button
            type="button"
            key={choice}
            aria-pressed={choice === bits}
            aria-label={`${choice}비트 (${levelCount(choice)}단계)`}
            onClick={() => change({ bits: String(choice) })}
          >
            {choice}비트
          </button>
        ))}
      </div>
      <p className="small-note">
        표본 수는 그래프 한 구간에서 소리의 높이를 몇 번 잴지, 양자화 비트는 잰 높이를 몇 비트로
        적을지 정합니다. 설정을 바꾸면 지금 단계에서 바로 다시 그립니다.
      </p>
    </section>
  )
}
