import { useState } from "react"
import { spacedBits } from "../shared/digits"
import { Quiz } from "../shared/Quiz"
import {
  bitsPerPixel,
  blankPixels,
  GRID,
  imageSize,
  palette,
  presetPixels,
  presets,
  rgbBits,
  rgbToHex,
  sameColor,
  toBlackWhite,
  type Depth,
  type Rgb,
} from "./engine"

const questions = [
  {
    text: "그림의 가로와 세로 픽셀 수를 모두 2배로 늘리면 픽셀 수는?",
    options: ["2배", "4배", "8배"],
    answer: 1,
    why: "가로 2배 × 세로 2배 = 4배입니다. 8×8 = 64픽셀이 16×16 = 256픽셀이 됩니다.",
  },
  {
    text: "흑백(1비트) 8×8 그림은 몇 바이트일까요?",
    options: ["8바이트", "64바이트", "192바이트"],
    answer: 0,
    why: "64픽셀 × 1비트 = 64비트이고, 8비트가 1바이트이므로 8바이트입니다.",
  },
  {
    text: "같은 8×8 그림을 흑백 대신 24비트 색으로 저장하면 용량은?",
    options: ["같다", "3배", "24배"],
    answer: 2,
    why: "픽셀 하나에 1비트 대신 24비트를 쓰므로 전체 용량도 24배가 됩니다.",
  },
] as const

const black: Rgb = { r: 0, g: 0, b: 0 }
const white: Rgb = { r: 255, g: 255, b: 255 }

type Tool = "look" | "paint"

/** 흑백에서는 밝기로 0(검정)·1(하양)을 정해 보여 준다. */
const shownColor = (color: Rgb, depth: Depth) =>
  depth === "bw" ? (toBlackWhite(color) ? white : black) : color

export function PixelCanvas({
  mixed,
  depth,
  change,
}: {
  /** RGB 탭에서 만든 색. 붓 색으로 고를 수 있다. */
  mixed: Rgb
  depth: Depth
  change: (updates: Record<string, string>) => void
}) {
  const [pixels, setPixels] = useState(() => presetPixels(presets[0]))
  const [selected, setSelected] = useState(0)
  const [tool, setTool] = useState<Tool>("look")
  const [brush, setBrush] = useState<Rgb>(palette[2].color)
  const size = imageSize(GRID, GRID, depth)
  const bw = depth === "bw"
  const brushes = bw
    ? [
        { name: "검정 (0)", color: black },
        { name: "하양 (1)", color: white },
      ]
    : [...palette, { name: "RGB 탭에서 만든 색", color: mixed }]
  const current = shownColor(pixels[selected], depth)
  const rowBits = (r: number) =>
    pixels
      .slice(r * GRID, (r + 1) * GRID)
      .map(color => toBlackWhite(color))
      .join("")
  const firstRow = spacedBits(rowBits(0))
  const row = Math.floor(selected / GRID) + 1
  const column = (selected % GRID) + 1

  function press(index: number) {
    setSelected(index)
    if (tool === "paint")
      setPixels(list => list.map((color, i) => (i === index ? { ...brush } : color)))
  }

  function load(next: Rgb[]) {
    setPixels(next)
    setSelected(0)
  }

  return (
    <>
      <section className="sim-card pixel-settings" aria-label="픽셀 그림 설정">
        <div className="button-row" role="group" aria-label="그림 불러오기">
          {presets.map(preset => (
            <button type="button" key={preset.id} onClick={() => load(presetPixels(preset))}>
              {preset.name}
            </button>
          ))}
          <button type="button" onClick={() => load(blankPixels())}>
            빈 도화지
          </button>
        </div>
        <div className="button-row" role="group" aria-label="색 깊이">
          <span className="pixel-group-label">색 깊이</span>
          <button type="button" aria-pressed={!bw} onClick={() => change({ depth: "color" })}>
            24비트 색
          </button>
          <button type="button" aria-pressed={bw} onClick={() => change({ depth: "bw" })}>
            흑백 1비트
          </button>
        </div>
        <div className="button-row" role="group" aria-label="도구">
          <span className="pixel-group-label">도구</span>
          <button type="button" aria-pressed={tool === "look"} onClick={() => setTool("look")}>
            살펴보기
          </button>
          <button type="button" aria-pressed={tool === "paint"} onClick={() => setTool("paint")}>
            칠하기
          </button>
        </div>
        {tool === "paint" && (
          <div className="button-row brush-row" role="group" aria-label="칠할 색">
            {brushes.map(item => (
              <button
                type="button"
                className="color-chip"
                aria-pressed={sameColor(shownColor(brush, depth), item.color)}
                onClick={() => setBrush(item.color)}
                key={item.name}
              >
                <span className="color-dot" style={{ background: rgbToHex(item.color) }} />
                {item.name}
              </button>
            ))}
          </div>
        )}
        <p className="small-note">
          {tool === "look"
            ? "픽셀을 누르면 그 픽셀에 저장된 값을 보여 줍니다."
            : "픽셀을 누르면 고른 색으로 칠합니다. 칠한 픽셀의 값도 함께 보여 줍니다."}{" "}
          흑백 1비트에서는 밝은 색을 하양(1), 어두운 색을 검정(0)으로 바꿔 저장합니다.
        </p>
      </section>

      <section className="sim-card" aria-label="픽셀 그림">
        <div className="pixel-stage">
          <div className="pixel-grid" role="group" aria-label={`${GRID}×${GRID} 픽셀 그림`}>
            {pixels.map((color, index) => {
              const shown = shownColor(color, depth)
              const code = bw ? String(toBlackWhite(color)) : rgbToHex(color)
              return (
                <button
                  type="button"
                  className="pixel"
                  aria-pressed={index === selected}
                  aria-label={`${Math.floor(index / GRID) + 1}행 ${(index % GRID) + 1}열, ${code}`}
                  style={{ background: rgbToHex(shown) }}
                  onClick={() => press(index)}
                  key={index}
                />
              )
            })}
          </div>

          <div className="pixel-info" aria-live="polite">
            <p className="pixel-info__title">
              {row}행 {column}열 픽셀
            </p>
            <span className="pixel-info__swatch" style={{ background: rgbToHex(current) }} />
            {bw ? (
              <dl className="pixel-info__codes">
                <div>
                  <dt>저장하는 비트</dt>
                  <dd className="pixel-mono">{toBlackWhite(current)}</dd>
                </div>
                <div>
                  <dt>뜻</dt>
                  <dd>{toBlackWhite(current) ? "하양" : "검정"}</dd>
                </div>
              </dl>
            ) : (
              <dl className="pixel-info__codes">
                <div>
                  <dt>RGB</dt>
                  <dd>
                    {current.r}, {current.g}, {current.b}
                  </dd>
                </div>
                <div>
                  <dt>16진수</dt>
                  <dd className="pixel-mono">{rgbToHex(current)}</dd>
                </div>
                <div>
                  <dt>이진수</dt>
                  <dd className="pixel-mono pixel-info__bits">
                    {rgbBits(current).map((bits, index) => (
                      <span key={index}>{bits}</span>
                    ))}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <dl className="stats pixel-stats">
          <div>
            <dt>픽셀 수</dt>
            <dd>
              {GRID}×{GRID} = {size.pixels}
            </dd>
          </div>
          <div>
            <dt>픽셀 하나</dt>
            <dd>{bitsPerPixel[depth]}비트</dd>
          </div>
          <div>
            <dt>그림 전체</dt>
            <dd>
              {size.bits.toLocaleString("ko-KR")}비트
              <small className="pixel-bytes"> = {size.bytes}바이트</small>
            </dd>
          </div>
        </dl>
        <p className="result" role="status" aria-live="polite">
          {bw
            ? `${size.pixels}픽셀 × 1비트 = ${size.bits}비트(${size.bytes}바이트). 색을 버리고 검정·하양만 남기면 24비트 색보다 용량이 24분의 1로 줄어듭니다.`
            : `${size.pixels}픽셀 × 24비트 = ${size.bits.toLocaleString("ko-KR")}비트(${size.bytes}바이트). 픽셀마다 R·G·B를 1바이트씩 저장합니다.`}
        </p>

        <details className="pixel-dump">
          <summary>저장되는 값 모두 보기</summary>
          {bw ? (
            <ol className="pixel-mono pixel-dump__bits" aria-label="줄마다 저장되는 비트">
              {Array.from({ length: GRID }, (_, r) => (
                <li key={r}>{spacedBits(rowBits(r))}</li>
              ))}
            </ol>
          ) : (
            <div className="table-scroll">
              <table className="pixel-mono pixel-dump__table">
                <tbody>
                  {Array.from({ length: GRID }, (_, r) => (
                    <tr key={r}>
                      {pixels.slice(r * GRID, (r + 1) * GRID).map((color, c) => (
                        <td key={c}>{rgbToHex(color)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="small-note">
            {bw
              ? `한 줄 ${GRID}픽셀이 ${GRID}비트, 곧 1바이트입니다. 예를 들어 첫 줄은 ${firstRow}입니다.`
              : "한 칸이 픽셀 하나이고, #RRGGBB의 두 자리씩이 빨강·초록·파랑 세기입니다."}
          </p>
        </details>
      </section>

      <section className="concepts" aria-labelledby="pixel-concept-title">
        <h2 id="pixel-concept-title">그림 한 장의 크기는 어떻게 정해질까?</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>해상도: 픽셀이 몇 개인가</h3>
            <p>
              가로와 세로의 픽셀 수를 해상도라고 합니다. 픽셀이 많을수록 그림이 더 자세해지지만,
              저장할 픽셀도 그만큼 많아집니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>색 깊이: 픽셀 하나에 몇 비트인가</h3>
            <p>
              흑백은 1비트, 흔히 쓰는 트루컬러는 24비트입니다. 그림 전체의 비트 수는 픽셀 수 × 색
              깊이이므로, 해상도나 색 깊이를 늘리면 용량이 커집니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}
