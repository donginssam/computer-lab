import { useState } from "react"
import type { ChangeParams } from "../../shared/useSimulatorParams"
import { palette, presetPixels, presets, type Depth, type Rgb } from "./engine"
import { PixelSettings, type PixelTool } from "./PixelSettings"
import { PixelResult } from "./PixelResult"
import { PixelConcepts } from "./PixelConcepts"

export function PixelCanvas({
  mixed,
  depth,
  change,
}: {
  /** RGB 탭에서 만든 색. 붓 색으로 고를 수 있다. */
  mixed: Rgb
  depth: Depth
  change: ChangeParams
}) {
  const [pixels, setPixels] = useState(() => presetPixels(presets[0]))
  const [selected, setSelected] = useState(0)
  const [tool, setTool] = useState<PixelTool>("look")
  const [brush, setBrush] = useState<Rgb>(palette[2].color)
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
      <PixelSettings
        mixed={mixed}
        depth={depth}
        tool={tool}
        brush={brush}
        onDepth={next => change({ depth: next })}
        onTool={setTool}
        onBrush={setBrush}
        onLoad={load}
      />
      <PixelResult pixels={pixels} selected={selected} depth={depth} onSelect={press} />
      <PixelConcepts />
    </>
  )
}
