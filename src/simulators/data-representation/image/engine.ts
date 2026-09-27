/**
 * 색과 픽셀 그림의 표현. 화면 상태와 무관한 순수 함수만 둔다.
 * 색은 빛의 삼원색 R·G·B를 각각 0~255(8비트)로 적은 24비트 트루컬러를 쓴다.
 */
import { toBinary, toHex } from "../../shared/digits"

export const CHANNEL_MAX = 255
export const CHANNEL_BITS = 8

export interface Rgb {
  r: number
  g: number
  b: number
}

export type Channel = keyof Rgb
export const channels: readonly Channel[] = ["r", "g", "b"]

/** 한 채널이 0~255 정수인지 확인한다. */
function assertChannel(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > CHANNEL_MAX)
    throw new RangeError(`색의 세기는 0~${CHANNEL_MAX} 사이의 정수입니다.`)
}

/** #RRGGBB */
export function rgbToHex(color: Rgb) {
  channels.forEach(channel => assertChannel(color[channel]))
  return `#${channels.map(channel => toHex(color[channel])).join("")}`
}

/** "#1e90ff", "1E90FF", "#fff"를 읽는다. 읽을 수 없으면 null. */
export function parseHex(text: string | null | undefined): Rgb | null {
  if (!text) return null
  const raw = text.trim().replace(/^#/, "")
  const full = /^[0-9a-f]{3}$/i.test(raw) ? [...raw].map(digit => digit + digit).join("") : raw
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** 24비트를 채널마다 8비트씩 */
export const rgbBits = (color: Rgb) => channels.map(channel => toBinary(color[channel]))

export const sameColor = (a: Rgb, b: Rgb) => channels.every(channel => a[channel] === b[channel])

/**
 * 흑백 1비트로 줄일 때의 밝기. 사람 눈은 초록을 가장 밝게, 파랑을 가장 어둡게 느끼므로
 * 널리 쓰는 가중치(ITU-R BT.601)를 쓴다. 128 이상이면 흰색(1)으로 본다.
 */
export const brightness = ({ r, g, b }: Rgb) => 0.299 * r + 0.587 * g + 0.114 * b
export const toBlackWhite = (color: Rgb): 0 | 1 => (brightness(color) >= 128 ? 1 : 0)

export type Depth = "color" | "bw"
/** 픽셀 하나에 쓰는 비트 수 */
export const bitsPerPixel: Record<Depth, number> = { color: 24, bw: 1 }

export function imageSize(width: number, height: number, depth: Depth) {
  const bits = width * height * bitsPerPixel[depth]
  return { pixels: width * height, bits, bytes: bits / 8 }
}

/* ─── 픽셀 그림 ─────────────────────────────── */

export const GRID = 8

export interface PaletteColor {
  key: string
  name: string
  color: Rgb
}

export const palette: readonly PaletteColor[] = [
  { key: "K", name: "검정", color: { r: 0, g: 0, b: 0 } },
  { key: "W", name: "하양", color: { r: 255, g: 255, b: 255 } },
  { key: "R", name: "빨강", color: { r: 255, g: 0, b: 0 } },
  { key: "G", name: "초록", color: { r: 0, g: 255, b: 0 } },
  { key: "B", name: "파랑", color: { r: 0, g: 0, b: 255 } },
  { key: "Y", name: "노랑", color: { r: 255, g: 255, b: 0 } },
  { key: "O", name: "주황", color: { r: 255, g: 136, b: 0 } },
  { key: "N", name: "갈색", color: { r: 139, g: 69, b: 19 } },
]

const byKey = Object.fromEntries(palette.map(item => [item.key, item.color]))

export interface Preset {
  id: string
  name: string
  rows: readonly string[]
}

/** 8×8 그림. 글자 하나가 픽셀 하나이며 palette의 key를 쓴다. */
export const presets: readonly Preset[] = [
  {
    id: "heart",
    name: "하트",
    rows: [
      "WRRWWRRW",
      "RRRRRRRR",
      "RRRRRRRR",
      "RRRRRRRR",
      "WRRRRRRW",
      "WWRRRRWW",
      "WWWRRWWW",
      "WWWWWWWW",
    ],
  },
  {
    id: "smile",
    name: "웃는 얼굴",
    rows: [
      "WWKKKKWW",
      "WKYYYYKW",
      "KYKYYKYK",
      "KYYYYYYK",
      "KYKYYKYK",
      "KYYKKYYK",
      "WKYYYYKW",
      "WWKKKKWW",
    ],
  },
  {
    id: "tree",
    name: "나무",
    rows: [
      "BBBGGBBB",
      "BBGGGGBB",
      "BGGGGGGB",
      "GGGGGGGG",
      "BBBNNBBB",
      "BBBNNBBB",
      "GGGNNGGG",
      "GGGGGGGG",
    ],
  },
]

export function presetPixels(preset: Preset): Rgb[] {
  if (preset.rows.length !== GRID || preset.rows.some(row => row.length !== GRID))
    throw new Error(`${preset.name} 그림은 ${GRID}×${GRID}이어야 합니다.`)
  return preset.rows.flatMap(row => [...row].map(key => ({ ...byKey[key] })))
}

export const blankPixels = (): Rgb[] => Array.from({ length: GRID * GRID }, () => ({ ...byKey.W }))
