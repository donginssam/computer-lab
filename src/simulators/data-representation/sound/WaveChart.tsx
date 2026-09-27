import { levelCount, levelValue, restoredValue, type Sample, type Wave } from "./engine"

const WIDTH = 640
const HEIGHT = 300
const PAD = { left: 52, right: 14, top: 24, bottom: 30 }
const plotW = WIDTH - PAD.left - PAD.right
const plotH = HEIGHT - PAD.top - PAD.bottom
const CURVE_POINTS = 320

const x = (t: number) => PAD.left + t * plotW
const y = (value: number) => PAD.top + (1 - (value + 1) / 2) * plotH

/** 코드 글자가 겹치지 않을 만큼 표본이 적을 때만 그래프 안에 적는다. */
const LABEL_LIMIT = 16

/**
 * 단계(stage)에 따라 한 겹씩 더해 그리는 파형 그래프.
 * 0 원래 소리 · 1 표본화 · 2 양자화 · 3 부호화 · 4 다시 그린 소리
 */
export function WaveChart({
  wave,
  samples,
  bits,
  stage,
}: {
  wave: Wave
  samples: readonly Sample[]
  bits: number
  stage: number
}) {
  const levels = Array.from({ length: levelCount(bits) }, (_, level) => level)
  const curve = Array.from({ length: CURVE_POINTS + 1 }, (_, i) => {
    const t = i / CURVE_POINTS
    return `${x(t).toFixed(1)},${y(wave.value(t)).toFixed(1)}`
  }).join(" ")
  // 계단: 표본마다 다음 표본까지 같은 높이로 가로선을 긋는다.
  const stairs = samples
    .map((sample, i) => {
      const from = x(sample.t)
      const to = x((i + 1) / samples.length)
      const level = y(restoredValue(samples, sample.t))
      return `${i === 0 ? "M" : "L"}${from.toFixed(1)},${level.toFixed(1)} H${to.toFixed(1)}`
    })
    .join(" ")
  const showLabels = samples.length <= LABEL_LIMIT

  return (
    <svg
      className="wave-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={chartLabel(stage, samples.length, bits)}
    >
      <rect className="wave-chart__frame" x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
      <line className="wave-chart__zero" x1={PAD.left} x2={PAD.left + plotW} y1={y(0)} y2={y(0)} />

      {stage >= 2 &&
        levels.map(level => (
          <g key={level} className="wave-chart__level">
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={y(levelValue(level, bits))}
              y2={y(levelValue(level, bits))}
            />
            <text x={PAD.left - 6} y={y(levelValue(level, bits))} textAnchor="end" dy="0.35em">
              {stage >= 3 ? level.toString(2).padStart(bits, "0") : level}
            </text>
          </g>
        ))}

      <polyline
        className={`wave-chart__curve ${stage >= 4 ? "wave-chart__curve--faded" : ""}`}
        points={curve}
      />

      {stage >= 1 &&
        samples.map(sample => (
          <g key={sample.index} className="wave-chart__sample">
            <line x1={x(sample.t)} x2={x(sample.t)} y1={y(0)} y2={y(sample.value)} />
            {stage >= 2 && (
              <line
                className="wave-chart__snap"
                x1={x(sample.t)}
                x2={x(sample.t)}
                y1={y(sample.value)}
                y2={y(sample.quantized)}
              />
            )}
            <circle
              className={stage >= 2 ? "wave-chart__measured--hollow" : "wave-chart__measured"}
              cx={x(sample.t)}
              cy={y(sample.value)}
              r={4.5}
            />
            {stage >= 2 && (
              <circle
                className="wave-chart__quantized"
                cx={x(sample.t)}
                cy={y(sample.quantized)}
                r={5}
              />
            )}
            {stage === 3 && showLabels && (
              <text
                className="wave-chart__code"
                x={x(sample.t)}
                y={y(sample.quantized) + (sample.quantized >= 0 ? -10 : 18)}
                textAnchor="middle"
              >
                {sample.code}
              </text>
            )}
          </g>
        ))}

      {stage >= 4 && <path className="wave-chart__stairs" d={stairs} />}

      <text className="wave-chart__axis" x={PAD.left} y={HEIGHT - 8}>
        시간 →
      </text>
      <text
        className="wave-chart__axis"
        x={12}
        y={PAD.top + plotH / 2}
        transform={`rotate(-90 12 ${PAD.top + plotH / 2})`}
        textAnchor="middle"
      >
        {stage >= 2 ? "단계" : "소리의 높이"}
      </text>
    </svg>
  )
}

function chartLabel(stage: number, count: number, bits: number) {
  switch (stage) {
    case 0:
      return "끊김 없이 이어지는 원래 소리의 파형"
    case 1:
      return `원래 파형 위에 같은 간격으로 잰 표본 ${count}개`
    case 2:
      return `표본 ${count}개를 가장 가까운 단계(${levelCount(bits)}단계)로 옮긴 그래프`
    case 3:
      return `단계마다 ${bits}비트 이진수 이름을 붙인 그래프`
    default:
      return "이진수만으로 다시 그린 계단 모양 소리와 흐리게 남긴 원래 파형"
  }
}
