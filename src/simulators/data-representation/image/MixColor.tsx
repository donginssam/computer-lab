import { useId, useState, type CSSProperties } from "react"
import { NumberField } from "../../shared/NumberField"
import { Quiz } from "../../shared/Quiz"
import { toBinary, toHex } from "../../shared/digits"
import { channelNames } from "./copy"
import {
  CHANNEL_MAX,
  channels,
  palette,
  parseHex,
  rgbBits,
  rgbToHex,
  sameColor,
  type Channel,
  type Rgb,
} from "./engine"

const questions = [
  {
    text: "#FFFFFF는 무슨 색일까요?",
    options: ["검정", "하양", "회색"],
    answer: 1,
    why: "FF는 255, 가장 센 빛입니다. 빨강·초록·파랑 빛을 모두 가장 세게 섞으면 하양이 됩니다.",
  },
  {
    text: "R·G·B를 각각 8비트로 쓰면 만들 수 있는 색은 몇 가지일까요?",
    options: ["256 × 3 = 768가지", "256 × 256 × 256 = 약 1,677만 가지", "24가지"],
    answer: 1,
    why: "채널마다 256가지 세기를 고를 수 있고, 세 채널을 곱하면 16,777,216가지입니다.",
  },
  {
    text: "빨강 빛과 초록 빛만 가장 세게 섞으면?",
    options: ["갈색", "노랑", "검정"],
    answer: 1,
    why: "빛은 섞을수록 밝아집니다. #FFFF00은 노랑입니다. 물감을 섞을 때와 결과가 다릅니다.",
  },
] as const

/** 색 이름을 알 수 있으면 붙인다. 회색 계열은 세 채널이 같을 때로 본다. */
function colorName(color: Rgb) {
  const named = palette.find(item => sameColor(item.color, color))
  if (named) return named.name
  if (color.r === color.g && color.g === color.b) return "회색"
  if (sameColor(color, { r: 0, g: 255, b: 255 })) return "청록"
  if (sameColor(color, { r: 255, g: 0, b: 255 })) return "자홍"
  return ""
}

const presetColors: readonly { name: string; color: Rgb }[] = [
  ...palette.filter(item => ["R", "G", "B", "Y", "K", "W"].includes(item.key)),
  { name: "청록", color: { r: 0, g: 255, b: 255 } },
  { name: "자홍", color: { r: 255, g: 0, b: 255 } },
]

export function MixColor({
  color,
  change,
}: {
  color: Rgb
  change: (updates: Record<string, string>) => void
}) {
  const hex = rgbToHex(color)
  const name = colorName(color)
  const setColor = (next: Rgb) => change({ color: rgbToHex(next).slice(1) })
  const setChannel = (channel: Channel, value: number) => setColor({ ...color, [channel]: value })

  return (
    <>
      <section className="sim-card" aria-label="빛의 세기 설정">
        <p className="small-note">
          빨강(R)·초록(G)·파랑(B) 빛의 세기를 0~{CHANNEL_MAX}로 정하세요. 0은 빛을 끈 것, 255는 가장
          센 빛입니다.
        </p>
        <div className="channel-rows">
          {channels.map(channel => (
            <div
              className={`sim-settings channel-row channel-row--${channel}`}
              key={channel}
              style={{ "--level": color[channel] / CHANNEL_MAX } as CSSProperties}
            >
              <NumberField
                label={`${channelNames[channel].name}(${channelNames[channel].letter})`}
                value={color[channel]}
                min={0}
                max={CHANNEL_MAX}
                onCommit={next => setChannel(channel, next)}
              />
              <label className="channel-slider">
                <span className="sr-only">{channelNames[channel].name} 세기 슬라이더</span>
                <input
                  type="range"
                  min={0}
                  max={CHANNEL_MAX}
                  value={color[channel]}
                  onChange={event => setChannel(channel, Number(event.target.value))}
                />
              </label>
              <span className="channel-code" aria-hidden="true">
                <b>{toHex(color[channel])}</b>
                <span>{toBinary(color[channel])}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="button-row" role="group" aria-label="자주 쓰는 색">
          {presetColors.map(item => (
            <button
              type="button"
              className="color-chip"
              key={item.name}
              aria-pressed={sameColor(item.color, color)}
              onClick={() => setColor(item.color)}
            >
              <span className="color-dot" style={{ background: rgbToHex(item.color) }} />
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="sim-card" aria-label="만든 색">
        <div className="mix-result">
          <div
            className="mix-swatch"
            style={{ background: hex }}
            role="img"
            aria-label={`만든 색 ${hex}${name ? `, ${name}` : ""}`}
          />
          <dl className="mix-codes">
            <div>
              <dt>십진수 (R, G, B)</dt>
              <dd>
                {color.r}, {color.g}, {color.b}
              </dd>
            </div>
            <div>
              <dt>16진수</dt>
              <dd className="pixel-mono">
                #
                {channels.map(channel => (
                  <span className={`code-${channel}`} key={channel}>
                    {toHex(color[channel])}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>이진수 (24비트)</dt>
              <dd className="pixel-mono mix-bits">
                {rgbBits(color).map((bits, index) => (
                  <span className={`code-${channels[index]}`} key={channels[index]}>
                    {bits}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <HexField hex={hex} onCommit={setColor} />
        <p className="result" role="status" aria-live="polite">
          {`${name ? `${name}: ` : ""}R ${color.r} · G ${color.g} · B ${color.b} → ${hex}. `}
          16진수 두 자리가 한 채널(8비트)이라 색 하나는 24비트 = 3바이트로 저장됩니다.
        </p>
      </section>

      <section className="concepts" aria-labelledby="mix-concept-title">
        <h2 id="mix-concept-title">왜 빨강·초록·파랑일까?</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>빛의 삼원색을 섞는다</h3>
            <p>
              화면의 픽셀은 빨강·초록·파랑 세 가지 작은 빛으로 되어 있습니다. 세 빛의 세기만 바꾸면
              거의 모든 색을 만들 수 있고, 빛은 섞을수록 밝아져 모두 켜면 하양이 됩니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>16진수는 4비트를 한 글자로</h3>
            <p>
              16진수 한 자리는 0~F(0~15), 곧 4비트입니다. 그래서 8비트 세기는 16진수 두 자리로 딱
              맞게 적을 수 있어, 24비트 이진수 대신 #2B6BE6처럼 짧게 씁니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}

/** 16진수 색 코드 입력. 칸을 벗어나거나 Enter로 확정할 때 읽고, 읽을 수 없으면 알려 준다. */
function HexField({ hex, onCommit }: { hex: string; onCommit: (color: Rgb) => void }) {
  const [text, setText] = useState(hex)
  const [shown, setShown] = useState(hex)
  const [error, setError] = useState(false)
  const inputId = useId()
  const errorId = useId()
  if (shown !== hex) {
    setShown(hex)
    setText(hex)
    setError(false)
  }

  function commit() {
    const parsed = parseHex(text)
    if (!parsed) {
      setError(true)
      return
    }
    setError(false)
    setText(rgbToHex(parsed))
    onCommit(parsed)
  }

  return (
    <div className="sim-settings hex-field">
      <label htmlFor={inputId}>
        16진수 색 코드로 입력
        <input
          id={inputId}
          type="text"
          value={text}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error}
          aria-describedby={error ? errorId : undefined}
          onChange={event => {
            setText(event.target.value)
            setError(false)
          }}
          onBlur={commit}
          onKeyDown={event => {
            if (event.key === "Enter") commit()
          }}
        />
      </label>
      {error && (
        <p id={errorId} className="sim-error number-field__warning" role="alert">
          색 코드는 #과 0~9, A~F로 된 여섯 글자입니다(예: #FF8800).
        </p>
      )}
    </div>
  )
}
