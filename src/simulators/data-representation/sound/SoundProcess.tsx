import { stages } from "./copy"
import { averageError, levelCount, totalBits, type Sample, type Wave } from "./engine"
import { WaveChart } from "./WaveChart"
import { SoundPlayback } from "./SoundPlayback"

export function SoundProcess({
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
  const count = samples.length
  const size = totalBits(count, bits)
  const error = averageError(wave, samples)
  return (
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

      <SoundPlayback wave={wave} samples={samples} />
    </section>
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
