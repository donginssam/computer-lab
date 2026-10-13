import {
  BLACK,
  blankPixels,
  palette,
  presetPixels,
  presets,
  rgbToHex,
  sameColor,
  shownColor,
  type Depth,
  type Rgb,
  WHITE,
} from "./engine"

export type PixelTool = "look" | "paint"

export function PixelSettings({
  mixed,
  depth,
  tool,
  brush,
  onDepth,
  onTool,
  onBrush,
  onLoad,
}: {
  mixed: Rgb
  depth: Depth
  tool: PixelTool
  brush: Rgb
  onDepth: (depth: Depth) => void
  onTool: (tool: PixelTool) => void
  onBrush: (color: Rgb) => void
  onLoad: (pixels: Rgb[]) => void
}) {
  const bw = depth === "bw"
  const brushes = bw
    ? [
        { name: "검정 (0)", color: BLACK },
        { name: "하양 (1)", color: WHITE },
      ]
    : [...palette, { name: "RGB 탭에서 만든 색", color: mixed }]
  return (
    <section className="sim-card pixel-settings" aria-label="픽셀 그림 설정">
      <div className="button-row" role="group" aria-label="그림 불러오기">
        {presets.map(preset => (
          <button type="button" key={preset.id} onClick={() => onLoad(presetPixels(preset))}>
            {preset.name}
          </button>
        ))}
        <button type="button" onClick={() => onLoad(blankPixels())}>
          빈 도화지
        </button>
      </div>
      <div className="button-row" role="group" aria-label="색 깊이">
        <span className="pixel-group-label">색 깊이</span>
        <button type="button" aria-pressed={!bw} onClick={() => onDepth("color")}>
          24비트 색
        </button>
        <button type="button" aria-pressed={bw} onClick={() => onDepth("bw")}>
          흑백 1비트
        </button>
      </div>
      <div className="button-row" role="group" aria-label="도구">
        <span className="pixel-group-label">도구</span>
        <button type="button" aria-pressed={tool === "look"} onClick={() => onTool("look")}>
          살펴보기
        </button>
        <button type="button" aria-pressed={tool === "paint"} onClick={() => onTool("paint")}>
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
              onClick={() => onBrush(item.color)}
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
  )
}
