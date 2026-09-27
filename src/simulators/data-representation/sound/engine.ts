/**
 * 아날로그 소리를 디지털로 바꾸는 과정. 화면 상태와 무관한 순수 함수만 둔다.
 *
 * 1. 표본화: 일정한 간격으로 소리의 높이(진폭)를 잰다.
 * 2. 양자화: 잰 값을 정해 둔 단계 중 가장 가까운 단계로 맞춘다.
 * 3. 부호화: 단계 번호를 이진수로 적는다.
 *
 * 시간 t는 그래프 한 구간을 0~1로, 소리의 높이는 −1~1로 둔다.
 */
import { toBinary } from "../../shared/digits"

export const SAMPLES_MIN = 4
export const SAMPLES_MAX = 32
export const BITS_MIN = 1
export const BITS_MAX = 4

export type WaveId = "smooth" | "complex"

export interface Wave {
  id: WaveId
  name: string
  value: (t: number) => number
}

const TAU = Math.PI * 2

/** 두 파형 모두 −1~1 안에 들도록 진폭을 정했다. */
export const waves: Record<WaveId, Wave> = {
  smooth: {
    id: "smooth",
    name: "부드러운 소리",
    value: t => 0.9 * Math.sin(TAU * 2 * t),
  },
  complex: {
    id: "complex",
    name: "복잡한 소리",
    value: t => 0.55 * Math.sin(TAU * 2 * t) + 0.35 * Math.sin(TAU * 5 * t + 1),
  },
}

export const levelCount = (bits: number) => 2 ** bits

/** −1~1의 값을 단계 눈금(0~단계 수−1)으로 읽는다. */
export const heightOf = (value: number, bits: number) => ((value + 1) / 2) * (levelCount(bits) - 1)

/** −1~1의 값을 0~(단계 수−1) 중 가장 가까운 단계로 맞춘다. */
export function quantize(value: number, bits: number) {
  const top = levelCount(bits) - 1
  return Math.max(0, Math.min(top, Math.round(heightOf(value, bits))))
}

/** 단계 번호가 뜻하는 소리의 높이(−1~1) */
export const levelValue = (level: number, bits: number) => (level / (levelCount(bits) - 1)) * 2 - 1

export interface Sample {
  index: number
  t: number
  /** 잰 값(아날로그, −1~1) */
  value: number
  /** 잰 값을 단계 눈금으로 읽은 높이. 반올림하면 level이 된다. */
  height: number
  /** 맞춘 단계 */
  level: number
  /** 단계가 뜻하는 값 */
  quantized: number
  /** 단계 번호를 적은 이진수 */
  code: string
}

function assertSettings(count: number, bits: number) {
  if (!Number.isInteger(count) || count < 1)
    throw new RangeError("표본 수는 1 이상의 정수여야 합니다.")
  if (!Number.isInteger(bits) || bits < 1)
    throw new RangeError("양자화 비트 수는 1 이상의 정수여야 합니다.")
}

/** 구간을 count칸으로 나눠 각 칸의 시작에서 잰다. */
export function digitize(wave: Wave, count: number, bits: number): Sample[] {
  assertSettings(count, bits)
  return Array.from({ length: count }, (_, index) => {
    const t = index / count
    const value = wave.value(t)
    const level = quantize(value, bits)
    return {
      index,
      t,
      value,
      height: heightOf(value, bits),
      level,
      quantized: levelValue(level, bits),
      code: toBinary(level, bits),
    }
  })
}

/** 이진수만 가지고 다시 그린 소리. 다음 표본까지 같은 높이를 유지한다(계단 모양). */
export function restoredValue(samples: readonly Sample[], t: number) {
  const index = Math.min(samples.length - 1, Math.max(0, Math.floor(t * samples.length)))
  return samples[index].quantized
}

/**
 * 원래 소리와 다시 그린 소리의 평균 차이. 높이 범위(−1~1, 폭 2)에 대한 백분율이다.
 * 구간을 촘촘히(resolution개 점) 비교한다.
 */
export function averageError(wave: Wave, samples: readonly Sample[], resolution = 960) {
  let total = 0
  for (let i = 0; i < resolution; i += 1) {
    const t = (i + 0.5) / resolution
    total += Math.abs(wave.value(t) - restoredValue(samples, t))
  }
  return (total / resolution / 2) * 100
}

/** 부호화한 전체 비트 수 */
export const totalBits = (count: number, bits: number) => count * bits
