import { describe, expect, it } from "vitest"
import { byteCount, decodeCode, encodeChar, encodeText, MAX_CHARS } from "./engine"

describe("문자 → 코드", () => {
  it("ASCII 문자는 코드 한 바이트로 저장한다", () => {
    expect(encodeChar("A")).toEqual({ char: "A", code: 65, ascii: true, bytes: [65] })
    expect(encodeChar(" ").bytes).toEqual([32])
    expect(encodeChar("~").code).toBe(126)
  })

  it("한글은 유니코드 번호를 UTF-8 세 바이트로 나눠 담는다", () => {
    const result = encodeChar("안")
    expect(result.code).toBe(0xc548)
    expect(result.ascii).toBe(false)
    expect(result.bytes).toEqual([0xec, 0x95, 0x88])
  })

  it("이모지처럼 두 칸짜리 문자도 한 글자로 센다", () => {
    const { chars } = encodeText("😀A")
    expect(chars.map(item => item.char)).toEqual(["😀", "A"])
    expect(chars[0].bytes).toHaveLength(4)
  })

  it("글자 수를 제한하고 넘친 글자 수를 알려 준다", () => {
    const { chars, dropped } = encodeText("A".repeat(MAX_CHARS + 3))
    expect(chars).toHaveLength(MAX_CHARS)
    expect(dropped).toBe(3)
    expect(byteCount(encodeText("Hi안").chars)).toBe(5)
  })
})

describe("코드 → 문자", () => {
  it("32~126은 보이는 글자, 32는 공백이다", () => {
    for (let code = 33; code <= 126; code += 1)
      expect(decodeCode(code)).toMatchObject({ kind: "letter", shown: String.fromCharCode(code) })
    expect(decodeCode(32).kind).toBe("space")
  })

  it("0~31과 127은 제어 문자, 128~255는 ASCII 밖이다", () => {
    expect(decodeCode(10)).toMatchObject({ kind: "control", label: "제어 문자 LF (줄 바꿈)" })
    expect(decodeCode(127).kind).toBe("control")
    expect(decodeCode(128).kind).toBe("outside")
    expect(decodeCode(255).kind).toBe("outside")
  })

  it("1바이트 밖의 수는 거부한다", () => {
    expect(() => decodeCode(256)).toThrow()
    expect(() => decodeCode(-1)).toThrow()
    expect(() => decodeCode(1.5)).toThrow()
  })

  it("대문자와 소문자는 32의 자리 비트 하나만 다르다", () => {
    for (let code = 65; code <= 90; code += 1)
      expect(decodeCode(code ^ 32).shown).toBe(String.fromCharCode(code).toLowerCase())
  })
})
