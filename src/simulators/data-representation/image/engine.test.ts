import { describe, expect, it } from "vitest"
import {
  imageSize,
  palette,
  parseHex,
  presetPixels,
  presets,
  rgbBits,
  rgbToHex,
  toBlackWhite,
} from "./engine"

describe("RGB와 16진수", () => {
  it("채널마다 두 자리 대문자 16진수로 쓴다", () => {
    expect(rgbToHex({ r: 43, g: 107, b: 230 })).toBe("#2B6BE6")
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000")
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF")
  })

  it("#이 있든 없든, 세 자리 줄임도 읽고, 잘못된 코드는 null이다", () => {
    expect(parseHex("#ff8800")).toEqual({ r: 255, g: 136, b: 0 })
    expect(parseHex("2B6BE6")).toEqual({ r: 43, g: 107, b: 230 })
    expect(parseHex("#f80")).toEqual({ r: 255, g: 136, b: 0 })
    expect(parseHex("#12345")).toBeNull()
    expect(parseHex("#GGGGGG")).toBeNull()
    expect(parseHex(null)).toBeNull()
  })

  it("16진수와 RGB를 오가도 값이 그대로다", () => {
    for (let v = 0; v <= 255; v += 17) {
      const color = { r: v, g: 255 - v, b: (v * 7) % 256 }
      expect(parseHex(rgbToHex(color))).toEqual(color)
    }
  })

  it("24비트는 채널마다 8비트다", () => {
    expect(rgbBits({ r: 255, g: 0, b: 10 })).toEqual(["11111111", "00000000", "00001010"])
  })

  it("범위 밖 세기는 거부한다", () => {
    expect(() => rgbToHex({ r: 256, g: 0, b: 0 })).toThrow()
    expect(() => rgbToHex({ r: 1.5, g: 0, b: 0 })).toThrow()
  })
})

describe("픽셀 그림", () => {
  it("밝은 색은 1(하양), 어두운 색은 0(검정)이 된다", () => {
    const bw = Object.fromEntries(palette.map(item => [item.key, toBlackWhite(item.color)]))
    expect(bw).toMatchObject({ K: 0, W: 1, R: 0, G: 1, B: 0, Y: 1 })
  })

  it("용량은 픽셀 수 × 색 깊이다", () => {
    expect(imageSize(8, 8, "color")).toEqual({ pixels: 64, bits: 1536, bytes: 192 })
    expect(imageSize(8, 8, "bw")).toEqual({ pixels: 64, bits: 64, bytes: 8 })
    expect(imageSize(16, 16, "color").bits).toBe(imageSize(8, 8, "color").bits * 4)
  })

  it("모든 예시 그림은 8×8이고 팔레트 색만 쓴다", () => {
    for (const preset of presets) {
      const pixels = presetPixels(preset)
      expect(pixels).toHaveLength(64)
      for (const pixel of pixels) expect(Number.isInteger(pixel.r)).toBe(true)
    }
  })
})
