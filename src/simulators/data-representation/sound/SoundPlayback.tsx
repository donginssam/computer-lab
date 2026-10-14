import { canListen, play } from "./listen"
import type { Sample, Wave } from "./engine"

export function SoundPlayback({ wave, samples }: { wave: Wave; samples: readonly Sample[] }) {
  if (!canListen()) return null
  return (
    <div className="button-row sound-listen">
      <span className="sound-group-label">들어 보기</span>
      <button type="button" onClick={() => play(wave, null)}>
        ♪ 원래 소리
      </button>
      <button type="button" onClick={() => play(wave, samples)}>
        ♪ 디지털 소리
      </button>
      <p className="small-note">
        그래프 한 구간을 1초에 110번 되풀이해 들려줍니다. 표본 수와 비트 수가 적을수록 거친 소리가
        납니다. 소리가 크지 않게 조절해 두세요.
      </p>
    </div>
  )
}
