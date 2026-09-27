/**
 * 십진수와 이진수 사이의 변환. 화면 상태와 무관한 순수 함수만 둔다.
 * 모든 이진수는 큰 자리부터 쓴 비트 배열(0 또는 1)로 다룬다.
 */

export type Bit = 0 | 1

/** 이 시뮬레이터가 다루는 한 수의 비트 수. 8비트 = 1바이트. */
export const WIDTH = 8
/** 8비트로 나타낼 수 있는 가장 큰 양의 정수 */
export const UNSIGNED_MAX = 2 ** WIDTH - 1

/** 큰 자리부터의 자릿값: 128, 64, …, 1 */
export function placeValues(width = WIDTH) {
  return Array.from({ length: width }, (_, i) => 2 ** (width - 1 - i))
}

function assertUnsigned(n: number, width: number) {
  if (!Number.isInteger(n) || n < 0 || n > 2 ** width - 1)
    throw new RangeError(`0~${2 ** width - 1} 사이의 정수만 ${width}비트로 나타낼 수 있습니다.`)
}

/** 양의 정수(0 포함)를 width비트 배열로 바꾼다. */
export function toBits(n: number, width = WIDTH): Bit[] {
  assertUnsigned(n, width)
  return placeValues(width).map(value => (Math.floor(n / value) % 2) as Bit)
}

/** 비트 배열을 양의 정수로 읽는다. */
export function fromBits(bits: readonly Bit[]) {
  return bits.reduce<number>((total, bit) => total * 2 + bit, 0)
}

export const bitString = (bits: readonly Bit[]) => bits.join("")

/** 앞쪽의 0을 뺀 이진수. 0은 "0"으로 쓴다. */
export const shortBinary = (n: number) => n.toString(2)

export interface DivisionRow {
  dividend: number
  quotient: number
  remainder: Bit
}

/**
 * 몫이 0이 될 때까지 2로 나눈 과정. 나머지를 마지막 줄부터 위로 읽으면 이진수가 된다.
 * 0은 나눌 필요가 없으므로 빈 배열을 돌려준다.
 */
export function divisionRows(n: number): DivisionRow[] {
  if (!Number.isInteger(n) || n < 0) throw new RangeError("0 이상의 정수를 입력해 주세요.")
  const rows: DivisionRow[] = []
  for (let dividend = n; dividend > 0; dividend = Math.floor(dividend / 2))
    rows.push({ dividend, quotient: Math.floor(dividend / 2), remainder: (dividend % 2) as Bit })
  return rows
}

/** 나머지를 아래에서 위로 읽은 이진수 */
export const readRemainders = (rows: readonly DivisionRow[]) =>
  rows.length
    ? rows
        .map(row => row.remainder)
        .reverse()
        .join("")
    : "0"
