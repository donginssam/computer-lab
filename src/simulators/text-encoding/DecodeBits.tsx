import { useId, useState } from "react"
import { spacedBits, toBinary, toHex } from "../shared/digits"
import { Quiz } from "../shared/Quiz"
import { ASCII_MAX, decodeCode } from "./engine"

const places = [128, 64, 32, 16, 8, 4, 2, 1]
/** ASCII 표의 행: 앞 3비트(맨 앞 비트는 늘 0이므로 010~111). 000·001행은 제어 문자라 뺀다. */
const rows = [2, 3, 4, 5, 6, 7]
const columns = Array.from({ length: 16 }, (_, i) => i)

/** 해독 문제로 내는 낱말. ASCII 대문자만 쓴다. */
const puzzles = ["CAT", "DOG", "SUN", "BIT", "DATA", "CODE", "BYTE", "MOON"] as const

const questions = [
  {
    text: "01000011을 ASCII 코드표로 읽으면?",
    options: ["A", "C", "c"],
    answer: 1,
    why: "0100 0011은 64 + 2 + 1 = 67입니다. A가 65이므로 67은 C입니다.",
  },
  {
    text: "ASCII 문자를 1바이트에 담으면 맨 앞 비트는?",
    options: ["항상 0", "항상 1", "글자마다 다르다"],
    answer: 0,
    why: "ASCII는 0~127, 7비트면 충분합니다. 8번째(128의 자리) 비트는 쓰지 않아 0입니다.",
  },
] as const

function randomPuzzle(except?: string) {
  const choices = puzzles.filter(word => word !== except)
  return choices[Math.floor(Math.random() * choices.length)]
}

export function DecodeBits({
  code,
  change,
}: {
  code: number
  change: (updates: Record<string, string>) => void
}) {
  const bits = [...toBinary(code)].map(Number)
  const decoded = decodeCode(code)
  const setCode = (next: number) => change({ c: String(next) })

  return (
    <>
      <section className="sim-card" aria-label="비트로 코드 만들기">
        <p className="small-note">
          비트를 눌러 0과 1을 바꾸거나, 아래 ASCII 코드표에서 글자를 고르세요. 두 쪽이 같은 코드를
          가리킵니다.
        </p>
        <div className="byte-toggles">
          {places.map((place, index) => (
            <button
              type="button"
              className="byte-toggle"
              aria-pressed={bits[index] === 1}
              aria-label={`${place}의 자리 비트, ${bits[index]}`}
              onClick={() => setCode(code ^ place)}
              key={place}
            >
              <span className="byte-toggle__bit" aria-hidden="true">
                {bits[index]}
              </span>
              <span className="byte-toggle__place">{place}</span>
            </button>
          ))}
        </div>
        <div className="decode-readout">
          <dl className="stats">
            <div>
              <dt>이진수</dt>
              <dd className="text-mono">{spacedBits(toBinary(code))}</dd>
            </div>
            <div>
              <dt>코드(십진수)</dt>
              <dd>{code}</dd>
            </div>
            <div>
              <dt>16진수</dt>
              <dd className="text-mono">{toHex(code)}</dd>
            </div>
          </dl>
          <p
            className={`decode-glyph decode-glyph--${decoded.kind}`}
            aria-label={`문자: ${decoded.label}`}
          >
            <span aria-hidden="true">{decoded.shown}</span>
          </p>
        </div>
        <p className="result" role="status" aria-live="polite">
          {decoded.kind === "outside"
            ? `${code}은 ASCII에 없습니다. ASCII는 0~${ASCII_MAX}(7비트)까지라서, 맨 앞 128의 자리 비트가 1이면 ASCII 문자가 아닙니다.`
            : decoded.kind === "control"
              ? `${code}은 글자 모양이 없는 ${decoded.label}입니다. 화면에 보이지 않고 컴퓨터에게 할 일을 알려 줍니다.`
              : `${spacedBits(toBinary(code))} = ${code} → ASCII 코드표에서 ‘${decoded.label}’입니다.`}
        </p>
        <div className="button-row">
          <button type="button" onClick={() => setCode(0)}>
            모두 0으로
          </button>
          <button type="button" onClick={() => setCode(code + (code < 255 ? 1 : 0))}>
            코드 + 1
          </button>
          <button type="button" onClick={() => setCode(code ^ 32)}>
            32의 자리 바꾸기 (대↔소문자)
          </button>
        </div>
      </section>

      <section className="sim-card" aria-labelledby="ascii-table-title">
        <h2 id="ascii-table-title">ASCII 코드표</h2>
        <p className="small-note">
          줄은 앞 4비트, 칸은 뒤 4비트입니다. 예를 들어 A는 0100줄 0001칸이라 0100 0001입니다.
          0000·0001줄(0~31)은 글자 모양이 없는 제어 문자라서 표에서 뺐습니다.
        </p>
        <div className="table-scroll">
          <table className="ascii-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">앞 4비트</span>
                </th>
                {columns.map(column => (
                  <th scope="col" key={column}>
                    {toBinary(column, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row}>
                  <th scope="row">{toBinary(row, 4)}</th>
                  {columns.map(column => {
                    const cell = row * 16 + column
                    const info = decodeCode(cell)
                    return (
                      <td key={cell}>
                        <button
                          type="button"
                          aria-pressed={cell === code}
                          aria-label={`${info.label}, 코드 ${cell}`}
                          onClick={() => setCode(cell)}
                        >
                          {info.kind === "letter"
                            ? info.shown
                            : info.kind === "space"
                              ? "␣"
                              : "DEL"}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Puzzle />

      <section className="concepts" aria-labelledby="decode-concept-title">
        <h2 id="decode-concept-title">같은 0과 1, 다른 뜻</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>약속을 알아야 읽을 수 있다</h3>
            <p>
              0100 0001은 수로 읽으면 65, ASCII 코드표로 읽으면 A입니다. 0과 1 자체에는 뜻이 없고,
              어떤 약속으로 읽느냐에 따라 수가 되기도 하고 글자가 되기도 합니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>코드표에도 규칙이 있다</h3>
            <p>
              숫자 0~9, 대문자 A~Z, 소문자 a~z가 각각 이어진 번호입니다. 대문자와 소문자는 32만큼,
              곧 32의 자리 비트 하나만 다릅니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}

/** 이진수로 쓴 낱말을 학생이 직접 읽어 보는 문제. 결과가 입력만으로 정해지므로 기록하지 않는다. */
function Puzzle() {
  const [word, setWord] = useState<string>(() => randomPuzzle())
  const [guess, setGuess] = useState("")
  const [checked, setChecked] = useState(false)
  const inputId = useId()
  const correct = guess.trim().toUpperCase() === word

  return (
    <section className="sim-card" aria-labelledby="puzzle-title">
      <h2 id="puzzle-title">숨은 낱말 읽기</h2>
      <p>아래 바이트를 ASCII 코드표로 읽어 낱말을 찾아보세요.</p>
      <ol className="puzzle-bytes text-mono" aria-label="숨은 낱말의 바이트">
        {Array.from(word).map((char, index) => (
          <li key={index}>{spacedBits(toBinary(char.charCodeAt(0)))}</li>
        ))}
      </ol>
      <div className="sim-settings">
        <label htmlFor={inputId}>
          내가 읽은 낱말
          <input
            id={inputId}
            type="text"
            value={guess}
            autoComplete="off"
            spellCheck={false}
            onChange={event => {
              setGuess(event.target.value)
              setChecked(false)
            }}
            onKeyDown={event => {
              if (event.key === "Enter") setChecked(true)
            }}
          />
        </label>
        <button type="button" className="primary" onClick={() => setChecked(true)}>
          확인
        </button>
        <button
          type="button"
          onClick={() => {
            setWord(current => randomPuzzle(current))
            setGuess("")
            setChecked(false)
          }}
        >
          새 문제
        </button>
      </div>
      {checked && (
        <p className="result" role="status" aria-live="polite">
          {correct
            ? `★ 정답! ${Array.from(word)
                .map(char => `${char}=${char.charCodeAt(0)}`)
                .join(", ")}`
            : "아직 아닙니다. 한 바이트씩 켜진 자리의 수를 더한 뒤 코드표에서 찾아보세요."}
        </p>
      )}
    </section>
  )
}
