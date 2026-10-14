import { restoredValue, type Sample, type Wave } from "./engine"

/** 그래프 한 구간을 1초에 몇 번 되풀이할지. 구간에 파형이 두 번 있으므로 기본음은 220Hz다. */
const REPEAT_HZ = 110
const SECONDS = 1.2
const VOLUME = 0.15

type AudioContextClass = typeof AudioContext

function audioContextClass(): AudioContextClass | undefined {
  if (typeof window === "undefined") return undefined
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext
  )
}

/** 소리를 낼 수 없는 환경(일부 브라우저, 테스트)에서는 듣기 버튼을 숨긴다. */
export const canListen = () => Boolean(audioContextClass())

let context: AudioContext | undefined

/**
 * 그래프 한 구간을 빠르게 되풀이해 들려준다. 원래 소리와, 이진수만으로 다시 그린 계단
 * 모양 소리를 같은 방식으로 만들어 두 소리의 차이를 귀로 비교하게 한다.
 */
export function play(wave: Wave, samples: readonly Sample[] | null) {
  const Context = audioContextClass()
  if (!Context) return
  context ??= new Context()
  void context.resume()
  const rate = context.sampleRate
  const length = Math.floor(rate * SECONDS)
  const buffer = context.createBuffer(1, length, rate)
  const data = buffer.getChannelData(0)
  const fade = Math.floor(rate * 0.03)
  for (let i = 0; i < length; i += 1) {
    const phase = ((i / rate) * REPEAT_HZ) % 1
    const value = samples ? restoredValue(samples, phase) : wave.value(phase)
    // 시작과 끝에서 딸깍 소리가 나지 않게 짧게 키우고 줄인다.
    const envelope = Math.min(1, i / fade, (length - 1 - i) / fade)
    data[i] = value * VOLUME * envelope
  }
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start()
}
