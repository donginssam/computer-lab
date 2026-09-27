import { describe, expect, it } from "vitest"
import {
  averageError,
  BITS_MAX,
  BITS_MIN,
  digitize,
  levelCount,
  levelValue,
  quantize,
  restoredValue,
  SAMPLES_MAX,
  SAMPLES_MIN,
  totalBits,
  waves,
} from "./engine"

describe("양자화", () => {
  it("n비트는 2ⁿ단계이고, 양 끝 값은 첫 단계와 마지막 단계다", () => {
    for (let bits = 1; bits <= 4; bits += 1) {
      const top = levelCount(bits) - 1
      expect(quantize(-1, bits)).toBe(0)
      expect(quantize(1, bits)).toBe(top)
      expect(levelValue(0, bits)).toBe(-1)
      expect(levelValue(top, bits)).toBe(1)
    }
  })

  it("가장 가까운 단계로 맞춘다", () => {
    // 3비트 = 8단계, 단계 사이 간격은 2/7
    for (let level = 0; level < 8; level += 1) {
      const center = levelValue(level, 3)
      expect(quantize(center + 0.1, 3)).toBe(level === 7 ? 7 : level)
      expect(quantize(center - 0.1, 3)).toBe(level === 0 ? 0 : level)
    }
  })

  it("범위를 벗어난 값도 첫 단계와 마지막 단계 안에 둔다", () => {
    expect(quantize(-3, 2)).toBe(0)
    expect(quantize(3, 2)).toBe(3)
  })
})

describe("표본화와 부호화", () => {
  it("같은 간격으로 재고, 단계 번호를 비트 수만큼의 이진수로 적는다", () => {
    const samples = digitize(waves.smooth, 8, 3)
    expect(samples.map(sample => sample.t)).toEqual([0, 1, 2, 3, 4, 5, 6, 7].map(i => i / 8))
    for (const sample of samples) {
      expect(sample.code).toHaveLength(3)
      expect(parseInt(sample.code, 2)).toBe(sample.level)
      expect(Math.round(sample.height)).toBe(sample.level)
    }
    expect(samples[0].level).toBe(4) // sin(0) = 0 → 3.5를 반올림
  })

  it("데이터 크기는 표본 수 × 양자화 비트다", () => {
    expect(totalBits(12, 3)).toBe(36)
    expect(
      digitize(waves.complex, 12, 3)
        .map(sample => sample.code)
        .join(""),
    ).toHaveLength(36)
  })

  it("다시 그린 소리는 다음 표본까지 같은 높이를 유지한다", () => {
    const samples = digitize(waves.smooth, 4, 2)
    expect(restoredValue(samples, 0.1)).toBe(samples[0].quantized)
    expect(restoredValue(samples, 0.26)).toBe(samples[1].quantized)
    expect(restoredValue(samples, 1)).toBe(samples[3].quantized)
  })

  it("표본 수나 비트를 늘리면 원래 소리와의 차이가 줄어든다", () => {
    for (const wave of Object.values(waves)) {
      const coarse = averageError(wave, digitize(wave, SAMPLES_MIN, BITS_MIN))
      const fine = averageError(wave, digitize(wave, SAMPLES_MAX, BITS_MAX))
      expect(fine).toBeLessThan(coarse / 3)
      expect(averageError(wave, digitize(wave, 24, 3))).toBeLessThan(
        averageError(wave, digitize(wave, 6, 3)),
      )
      expect(averageError(wave, digitize(wave, 24, 4))).toBeLessThan(
        averageError(wave, digitize(wave, 24, 1)),
      )
    }
  })

  it("두 파형 모두 −1~1 안에 있다", () => {
    for (const wave of Object.values(waves))
      for (let i = 0; i <= 1000; i += 1)
        expect(Math.abs(wave.value(i / 1000))).toBeLessThanOrEqual(1)
  })

  it("잘못된 설정은 거부한다", () => {
    expect(() => digitize(waves.smooth, 0, 3)).toThrow()
    expect(() => digitize(waves.smooth, 8, 0)).toThrow()
  })
})
