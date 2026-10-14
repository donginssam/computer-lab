import { spacedBits } from "../../shared/digits"
import {
  bitsPerPixel,
  GRID,
  imageSize,
  rgbBits,
  rgbToHex,
  shownColor,
  toBlackWhite,
  type Depth,
  type Rgb,
} from "./engine"

export function PixelResult({
  pixels,
  selected,
  depth,
  onSelect,
}: {
  pixels: readonly Rgb[]
  selected: number
  depth: Depth
  onSelect: (index: number) => void
}) {
  const size = imageSize(GRID, GRID, depth)
  const bw = depth === "bw"
  const current = shownColor(pixels[selected], depth)
  const rowBits = (r: number) =>
    pixels
      .slice(r * GRID, (r + 1) * GRID)
      .map(color => toBlackWhite(color))
      .join("")
  const firstRow = spacedBits(rowBits(0))
  const row = Math.floor(selected / GRID) + 1
  const column = (selected % GRID) + 1

  return (
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
                onClick={() => onSelect(index)}
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
  )
}
