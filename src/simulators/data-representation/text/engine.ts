/**
 * 문자와 코드 사이의 변환. 화면 상태와 무관한 순수 함수만 둔다.
 * ASCII는 0~127(7비트)이며, 화면에서는 1바이트(8비트)로 맞춰 맨 앞에 0을 붙여 보여 준다.
 */

/** ASCII가 쓰는 가장 큰 코드 */
export const ASCII_MAX = 127
/** 1바이트로 나타낼 수 있는 가장 큰 코드 */
export const BYTE_MAX = 255
/** 한 번에 바꿔 보는 문자 수. 표가 너무 길어지지 않게 막는다. */
export const MAX_CHARS = 12

export interface EncodedChar {
  char: string
  /** 유니코드 번호. ASCII 문자는 ASCII 코드와 같다. */
  code: number
  ascii: boolean
  /** 컴퓨터에 실제로 저장되는 바이트(UTF-8). ASCII 문자는 코드 1바이트 그대로다. */
  bytes: number[]
}

const encoder = new TextEncoder()

/** 이모지처럼 두 칸짜리 문자도 한 글자로 센다. */
export const splitChars = (text: string) => Array.from(text)

export function encodeChar(char: string): EncodedChar {
  const code = char.codePointAt(0) ?? 0
  return { char, code, ascii: code <= ASCII_MAX, bytes: [...encoder.encode(char)] }
}

/** 최대 MAX_CHARS 글자까지 바꾼다. 넘친 글자 수도 함께 돌려준다. */
export function encodeText(text: string, limit = MAX_CHARS) {
  const chars = splitChars(text)
  return {
    chars: chars.slice(0, limit).map(encodeChar),
    dropped: Math.max(0, chars.length - limit),
  }
}

export const byteCount = (chars: readonly EncodedChar[]) =>
  chars.reduce((total, item) => total + item.bytes.length, 0)

/** 글자로 보이지 않는 제어 문자 중 교과서에 자주 나오는 것 */
const controlNames: Record<number, string> = {
  0: "NUL (빈 문자)",
  8: "BS (한 칸 지우기)",
  9: "TAB (탭)",
  10: "LF (줄 바꿈)",
  13: "CR (줄 처음으로)",
  27: "ESC (나가기)",
  127: "DEL (지우기)",
}

export type CodeKind = "letter" | "space" | "control" | "outside"

export interface DecodedCode {
  kind: CodeKind
  /** 화면에 크게 보여 줄 모양 */
  shown: string
  label: string
}

/** 0~255 코드를 ASCII 표에서 찾는다. */
export function decodeCode(code: number): DecodedCode {
  if (!Number.isInteger(code) || code < 0 || code > BYTE_MAX)
    throw new RangeError(`0~${BYTE_MAX} 사이의 정수만 1바이트 코드로 읽을 수 있습니다.`)
  if (code > ASCII_MAX) return { kind: "outside", shown: "?", label: "ASCII 밖" }
  if (code === 32) return { kind: "space", shown: "␣", label: "공백(띄어쓰기)" }
  if (code < 32 || code === ASCII_MAX)
    return { kind: "control", shown: "·", label: `제어 문자 ${controlNames[code] ?? ""}`.trim() }
  return { kind: "letter", shown: String.fromCharCode(code), label: String.fromCharCode(code) }
}

/** ASCII 표에서 한 문자를 부를 때 쓰는 이름. 공백은 눈에 보이게 쓴다. */
export const charLabel = (char: string) => (char === " " ? "공백" : char)
