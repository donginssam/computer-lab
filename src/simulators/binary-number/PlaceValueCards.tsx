import { useState } from "react"
import { Quiz } from "../shared/Quiz"
import { NumberField } from "./NumberField"
import { binaryCopy, spacedBits } from "./copy"
import { bitString, fromBits, placeValues, toBits, UNSIGNED_MAX, type Bit } from "./engine"

const values = placeValues()

const questions = [
  {
    text: "이진수 1011을 십진수로 읽으면?",
    options: ["11", "13", "1011"],
    answer: 0,
    why: "켜진 카드는 8·2·1이므로 8 + 2 + 1 = 11입니다.",
  },
  {
    text: "8비트로 나타낼 수 있는 가장 큰 양의 정수는?",
    options: ["128", "255", "256"],
    answer: 1,
    why: "카드 8장을 모두 켜면 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255입니다. 0부터 255까지 256가지입니다.",
  },
  {
    text: "카드를 한 장 더 붙여 9비트로 만들면 새 카드의 수는?",
    options: ["129", "200", "256"],
    answer: 2,
    why: "카드는 왼쪽으로 갈 때마다 2배가 됩니다. 128의 2배는 256입니다.",
  },
] as const

export function PlaceValueCards({
  target,
  change,
}: {
  target: number
  change: (updates: Record<string, string>) => void
}) {
  const [bits, setBits] = useState<Bit[]>(() => toBits(0))
  // 만들 수가 바뀌면 새 문제이므로 카드를 모두 끈다. 컴포넌트를 새로 만들지 않아야
  // 입력칸이 남긴 경고가 함께 사라지지 않는다.
  const [cardsFor, setCardsFor] = useState(target)
  if (cardsFor !== target) {
    setCardsFor(target)
    setBits(toBits(0))
  }
  const total = fromBits(bits)
  const matched = total === target

  function toggle(index: number) {
    setBits(current => current.map((bit, i) => (i === index ? ((1 - bit) as Bit) : bit)))
  }

  return (
    <>
      <section className="sim-card binary-settings" aria-label="자릿값 카드 설정">
        <NumberField
          label="만들 수"
          value={target}
          min={0}
          max={UNSIGNED_MAX}
          onCommit={next => change({ n: String(next) })}
        />
        <button
          type="button"
          onClick={() => change({ n: String(Math.floor(Math.random() * (UNSIGNED_MAX + 1))) })}
        >
          무작위 수
        </button>
        <button type="button" onClick={() => setBits(toBits(0))}>
          모두 끄기
        </button>
        <p className="small-note">
          카드를 눌러 켜고 끄세요. 켜진 카드의 수를 더해 {target}을 만들면 성공입니다.{" "}
          {binaryCopy.bitGloss}
        </p>
      </section>

      <section className="sim-card" aria-label="자릿값 카드">
        <div className="bit-cards">
          {values.map((value, index) => (
            <button
              type="button"
              className="bit-card"
              aria-pressed={bits[index] === 1}
              aria-label={`${value} 카드, ${bits[index] ? "켜짐" : "꺼짐"}`}
              onClick={() => toggle(index)}
              key={value}
            >
              <span className="bit-card__value">{value}</span>
              <span className="bit-card__bit" aria-hidden="true">
                {bits[index]}
              </span>
            </button>
          ))}
        </div>
        <dl className="stats binary-readout">
          <div>
            <dt>이진수</dt>
            <dd className="binary-digits">{spacedBits(bitString(bits))}</dd>
          </div>
          <div>
            <dt>켜진 카드의 합</dt>
            <dd>
              {total}
              {bits.some(Boolean) && (
                <small className="binary-sum">
                  {" "}
                  = {values.filter((_, i) => bits[i]).join(" + ")}
                </small>
              )}
            </dd>
          </div>
          <div>
            <dt>만들 수</dt>
            <dd>{target}</dd>
          </div>
        </dl>
        <p className={`result ${matched ? "binary-match" : ""}`} role="status" aria-live="polite">
          {matched
            ? `★ 성공! ${target}을 이진수로 쓰면 ${spacedBits(bitString(bits))}입니다.`
            : total < target
              ? `${target - total}만큼 더 필요합니다. 큰 카드부터 켤지 말지 정해 보세요.`
              : `${total - target}만큼 넘쳤습니다. 켜진 카드 중 하나를 꺼 보세요.`}
        </p>
      </section>

      <section className="concepts" aria-labelledby="cards-concept-title">
        <h2 id="cards-concept-title">왜 카드마다 2배일까?</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>한 칸에 들어갈 수 있는 수는 0과 1뿐</h3>
            <p>
              십진수는 한 자리에 0~9를 쓰므로 자리가 왼쪽으로 갈 때마다 10배가 됩니다. 이진수는 한
              자리에 0과 1만 쓰므로 2배씩 커집니다. 그래서 카드가 1, 2, 4, 8, …처럼 늘어납니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>모든 수를 한 가지로 만든다</h3>
            <p>
              어떤 카드든 오른쪽 카드를 모두 더한 것보다 1 큽니다(8 = 4 + 2 + 1 + 1). 그래서 큰
              카드부터 &quot;켤까, 말까&quot;만 정하면 0~255의 수를 모두, 한 가지 방법으로만 만들 수
              있습니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}
