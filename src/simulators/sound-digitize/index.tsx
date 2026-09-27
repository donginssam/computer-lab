import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import { unitById, unitStyle } from "../../content/units"
import { NumberField } from "../shared/NumberField"
import { clampedParam, clampInteger, oneOfParam } from "../shared/params"
import { Quiz } from "../shared/Quiz"
import { RunControls } from "../shared/RunControls"
import { SimulatorHeader } from "../shared/SimulatorHeader"
import { useStepRun } from "../shared/useStepRun"
import { soundCopy, stages } from "./copy"
import {
  averageError,
  BITS_MAX,
  BITS_MIN,
  digitize,
  levelCount,
  SAMPLES_MAX,
  SAMPLES_MIN,
  totalBits,
  waves,
  type WaveId,
} from "./engine"
import { canListen, play } from "./listen"
import { WaveChart } from "./WaveChart"
import "./simulator.css"

const waveIds = Object.keys(waves) as WaveId[]
const bitChoices = Array.from({ length: BITS_MAX - BITS_MIN + 1 }, (_, i) => BITS_MIN + i)

const questions = [
  {
    text: "소리를 디지털로 바꾸는 순서로 알맞은 것은?",
    options: ["표본화 → 양자화 → 부호화", "부호화 → 표본화 → 양자화", "양자화 → 부호화 → 표본화"],
    answer: 0,
    why: "먼저 일정한 간격으로 높이를 재고(표본화), 가까운 단계로 맞춘 뒤(양자화), 단계 번호를 이진수로 적습니다(부호화).",
  },
  {
    text: "양자화 비트를 3비트에서 4비트로 늘리면 단계 수는?",
    options: ["4단계 → 5단계", "8단계 → 16단계", "3단계 → 4단계"],
    answer: 1,
    why: "n비트로는 2ⁿ가지를 나타냅니다. 2³ = 8, 2⁴ = 16이므로 단계가 두 배로 촘촘해집니다.",
  },
  {
    text: "양자화 비트는 그대로 두고 표본 수를 2배로 늘리면 데이터 크기는?",
    options: ["그대로", "2배", "4배"],
    answer: 1,
    why: "데이터 크기는 표본 수 × 양자화 비트 수입니다. 표본 수가 2배이면 비트 수도 2배가 됩니다.",
  },
] as const

export function SoundDigitizePage() {
  const unit = unitById("data")!
  const [params, setParams] = useSearchParams()
  const waveId = oneOfParam(params.get("wave"), waveIds, "smooth")
  const count = clampedParam(params.get("n"), 12, value =>
    clampInteger(value, SAMPLES_MIN, SAMPLES_MAX),
  )
  const bits = clampedParam(params.get("bits"), 3, value => clampInteger(value, BITS_MIN, BITS_MAX))
  const wave = waves[waveId]
  const samples = useMemo(() => digitize(wave, count, bits), [wave, count, bits])
  const error = averageError(wave, samples)
  // 설정을 바꿔도 단계는 그대로 두어, 같은 단계에서 무엇이 달라지는지 바로 비교하게 한다.
  const { tick: stage, controls } = useStepRun(stages.length - 1)

  const change = useCallback(
    (key: string, value: string) => {
      setParams(
        current => {
          const next = new URLSearchParams(current)
          next.set(key, value)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const size = totalBits(count, bits)

  return (
    <div className="sim-page sound-page" style={unitStyle(unit)}>
      <SimulatorHeader unit={unit} slug="sound-digitize">
        {soundCopy.lead}
      </SimulatorHeader>

      <section className="sim-card sim-settings sound-settings" aria-label="디지털 변환 설정">
        <div className="button-row" role="group" aria-label="소리 모양">
          {waveIds.map(id => (
            <button
              type="button"
              key={id}
              aria-pressed={id === waveId}
              onClick={() => change("wave", id)}
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
          onCommit={next => change("n", String(next))}
        />
        <label className="sound-range">
          <span className="sr-only">표본 수 슬라이더</span>
          <input
            type="range"
            min={SAMPLES_MIN}
            max={SAMPLES_MAX}
            value={count}
            onChange={event => change("n", event.target.value)}
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
              onClick={() => change("bits", String(choice))}
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

      <RunControls {...controls} />

      <section className="sim-card" aria-label="디지털 변환 과정">
        <ol className="stage-list" aria-label="변환 단계">
          {stages.map((item, index) => (
            <li
              key={item.title}
              className={index === stage ? "current" : index < stage ? "past" : ""}
              aria-current={index === stage ? "step" : undefined}
            >
              {item.title}
            </li>
          ))}
        </ol>

        <WaveChart wave={wave} samples={samples} bits={bits} stage={stage} />

        <p className="result" role="status" aria-live="polite">
          {stageMessage(stage, count, bits, error)}
        </p>

        {stage >= 1 && (
          <ol className="sample-list" aria-label="표본 값">
            {samples.map(sample => (
              <li key={sample.index}>
                <span className="sample-list__index">{sample.index + 1}</span>
                <span className="sample-list__height">{sample.height.toFixed(1)}</span>
                {stage >= 2 && <span className="sample-list__level">→ {sample.level}</span>}
                {stage >= 3 && <span className="sample-list__code">{sample.code}</span>}
              </li>
            ))}
          </ol>
        )}
        {stage >= 1 && (
          <p className="small-note">
            {stage === 1 && "숫자는 잰 높이를 단계 눈금으로 읽은 값입니다."}
            {stage === 2 && "잰 높이(소수)를 가장 가까운 단계(정수)로 반올림했습니다."}
            {stage >= 3 && "맨 오른쪽이 실제로 저장하는 0과 1입니다."}
          </p>
        )}
        {stage >= 3 && (
          <p className="sound-stream" aria-label="저장되는 비트">
            {samples.map(sample => sample.code).join(" ")}
          </p>
        )}

        <dl className="stats sound-stats">
          <div>
            <dt>표본 수</dt>
            <dd>{count}개</dd>
          </div>
          <div>
            <dt>단계 수</dt>
            <dd>
              {levelCount(bits)}단계
              <small className="sound-sub"> ({bits}비트)</small>
            </dd>
          </div>
          <div>
            <dt>데이터 크기</dt>
            <dd>
              {size}비트
              <small className="sound-sub">
                {" "}
                = {count} × {bits}
              </small>
            </dd>
          </div>
        </dl>

        {canListen() && (
          <div className="button-row sound-listen">
            <span className="sound-group-label">들어 보기</span>
            <button type="button" onClick={() => play(wave, null)}>
              ♪ 원래 소리
            </button>
            <button type="button" onClick={() => play(wave, samples)}>
              ♪ 디지털 소리
            </button>
            <p className="small-note">
              그래프 한 구간을 1초에 110번 되풀이해 들려줍니다. 표본 수와 비트 수가 적을수록 거친
              소리가 납니다. 소리가 크지 않게 조절해 두세요.
            </p>
          </div>
        )}
      </section>

      <section className="concepts" aria-labelledby="sound-concept-title">
        <h2 id="sound-concept-title">음질과 용량은 함께 움직인다</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>자주 잴수록(표본화)</h3>
            <p>
              같은 시간 동안 더 자주 재면 빠르게 바뀌는 소리까지 담을 수 있습니다. 음악 CD는 1초에
              44,100번 잽니다. 대신 잰 횟수만큼 저장할 수가 늘어납니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>잘게 나눌수록(양자화)</h3>
            <p>
              단계가 촘촘하면 반올림으로 생기는 차이가 줄어듭니다. 비트를 1개 늘릴 때마다 단계는
              2배가 되지만, 표본 하나를 적는 데 비트가 하나씩 더 듭니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>

      <p className="small-note">{soundCopy.hiddenSetting}</p>
    </div>
  )
}

function stageMessage(stage: number, count: number, bits: number, error: number) {
  switch (stage) {
    case 0:
      return "마이크로 들어온 소리는 끊김 없이 이어지는 파형(아날로그 신호)입니다. 다음 단계를 눌러 0과 1로 바꿔 보세요."
    case 1:
      return `① 표본화: 같은 간격으로 소리의 높이를 ${count}번 쟀습니다. 재지 않은 사이의 소리는 저장하지 않습니다.`
    case 2:
      return `② 양자화: 잰 높이를 ${levelCount(bits)}개 단계 중 가장 가까운 단계로 맞췄습니다. 반올림하면서 원래 높이와 조금씩 달라집니다.`
    case 3:
      return `③ 부호화: 단계 번호를 ${bits}비트 이진수로 적었습니다. 표본 ${count}개 × ${bits}비트 = ${totalBits(count, bits)}비트입니다.`
    default:
      return `0과 1만으로 다시 그리면 계단 모양 소리가 됩니다. 원래 소리와 평균 ${error.toFixed(1)}% 차이가 납니다. 표본 수나 양자화 비트를 늘려 차이를 줄여 보세요.`
  }
}
