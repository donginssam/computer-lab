/** 여러 데이터 시뮬레이터가 함께 쓰는 자릿수 맞춤 표기. */

/** 큰 자리부터의 이진 자릿값: 기본 8비트에서는 128, 64, …, 1 */
export function placeValues(width = 8) {
  return Array.from({ length: width }, (_, i) => 2 ** (width - 1 - i))
}

/** 8비트 범위를 넘는 값을 가장 큰 수로 바꿨을 때 NumberField에 덧붙이는 이유. */
export const byteMaxNote = (max: number) => `8비트로 나타낼 수 있는 가장 큰 수가 ${max}입니다.`

/** 0을 채운 이진수. 8비트 = 1바이트가 기본이다. */
export const toBinary = (n: number, width = 8) => n.toString(2).padStart(width, "0")

/** 대문자 16진수. 1바이트는 두 자리다. */
export const toHex = (n: number, digits = 2) => n.toString(16).toUpperCase().padStart(digits, "0")

/** 이진수를 읽기 쉽게 4비트마다 띄운다. */
export const spacedBits = (text: string) => text.replace(/(.{4})(?=.)/g, "$1 ")
