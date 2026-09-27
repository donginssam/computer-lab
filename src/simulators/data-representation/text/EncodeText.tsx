import { useId, useState, type CSSProperties } from "react"
import { spacedBits, toBinary, toHex } from "../../shared/digits"
import { Quiz } from "../../shared/Quiz"
import { samples } from "./copy"
import { byteCount, charLabel, encodeText, MAX_CHARS } from "./engine"

const questions = [
  {
    text: "B의 ASCII 코드가 66이라면 C의 코드는?",
    options: ["65", "67", "99"],
    answer: 1,
    why: "ASCII 코드표는 알파벳을 순서대로 번호 매겼습니다. B 다음 글자인 C는 67입니다.",
  },
  {
    text: "ASCII 문자 5개(예: HELLO)를 저장하려면 몇 비트가 필요할까요?",
    options: ["5비트", "8비트", "40비트"],
    answer: 2,
    why: "ASCII 문자 하나는 1바이트(8비트)로 저장합니다. 5글자 × 8비트 = 40비트입니다.",
  },
  {
    text: "A(65)와 a(97)의 이진수는 몇 비트가 다를까요?",
    options: ["1비트", "4비트", "8비트 모두"],
    answer: 0,
    why: "0100 0001과 0110 0001은 32의 자리 하나만 다릅니다. 97 − 65 = 32입니다.",
  },
] as const

export function EncodeText({
  value,
  change,
}: {
  value: string
  change: (updates: Record<string, string>) => void
}) {
  // 한글 입력 중(조합 중)에도 칸이 흔들리지 않도록 칸의 글자는 이 컴포넌트가 들고,
  // 주소는 뒤따라 바꾼다. 예시 버튼으로 주소가 바뀌면 칸도 따라간다.
  const [text, setText] = useState(value)
  const [shown, setShown] = useState(value)
  if (shown !== value) {
    setShown(value)
    setText(value)
  }
  const inputId = useId()
  const { chars, dropped } = encodeText(text)
  const bytes = byteCount(chars)
  const allAscii = chars.every(item => item.ascii)
  const stream = chars.flatMap(item => item.bytes.map(byte => toBinary(byte)))

  function edit(next: string) {
    setText(next)
    setShown(next)
    change({ t: next })
  }

  return (
    <>
      <section className="sim-card sim-settings" aria-label="바꿀 글자 설정">
        <label htmlFor={inputId}>
          바꿀 글자
          <input
            id={inputId}
            type="text"
            value={text}
            autoComplete="off"
            spellCheck={false}
            onChange={event => edit(event.target.value)}
          />
        </label>
        <div className="button-row" role="group" aria-label="예시 글자">
          {samples.map(sample => (
            <button type="button" key={sample} onClick={() => edit(sample)}>
              {sample}
            </button>
          ))}
        </div>
        <p className="small-note">
          글자를 입력하면 바로 코드와 이진수로 바뀝니다. 한 번에 {MAX_CHARS}글자까지 볼 수 있습니다.
        </p>
        {dropped > 0 && (
          <p className="sim-error text-overflow" role="alert">
            {MAX_CHARS}글자가 넘어서 뒤의 {dropped}글자는 표에 넣지 않았습니다.
          </p>
        )}
      </section>

      <section className="sim-card" aria-label="글자별 코드">
        {chars.length === 0 ? (
          <p className="empty-state small-note">위 칸에 글자를 입력해 보세요.</p>
        ) : (
          <div
            className="table-scroll text-table"
            style={{ "--table-min": "520px" } as CSSProperties}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">글자</th>
                  <th scope="col">코드(십진수)</th>
                  <th scope="col">16진수</th>
                  <th scope="col">이진수</th>
                  <th scope="col">바이트</th>
                </tr>
              </thead>
              <tbody>
                {chars.map((item, index) => (
                  <tr key={index} className={item.ascii ? "" : "text-row--unicode"}>
                    <th scope="row" className="text-glyph">
                      {item.char === " " ? <span aria-label="공백">␣</span> : item.char}
                    </th>
                    <td>
                      {item.code}
                      {!item.ascii && <small className="text-tag">유니코드</small>}
                    </td>
                    <td className="text-mono">{item.bytes.map(byte => toHex(byte)).join(" ")}</td>
                    <td className="text-mono">
                      {item.bytes.map(byte => spacedBits(toBinary(byte))).join(" / ")}
                    </td>
                    <td>{item.bytes.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <dl className="stats">
          <div>
            <dt>글자 수</dt>
            <dd>{chars.length}</dd>
          </div>
          <div>
            <dt>바이트</dt>
            <dd>{bytes}</dd>
          </div>
          <div>
            <dt>비트</dt>
            <dd>{bytes * 8}</dd>
          </div>
        </dl>
        {chars.length > 0 && (
          <>
            <p className="result" role="status" aria-live="polite">
              {allAscii
                ? `${chars.map(item => charLabel(item.char)).join(", ")} → ASCII 문자 ${chars.length}개는 한 글자에 1바이트씩, 모두 ${bytes * 8}비트입니다.`
                : `ASCII 코드표에 없는 글자(한글 등)는 유니코드 번호를 UTF-8 방식으로 여러 바이트에 나눠 담습니다. 모두 ${bytes}바이트 = ${bytes * 8}비트입니다.`}
            </p>
            <p className="text-label">컴퓨터에 저장되는 0과 1</p>
            <p className="text-stream text-mono" aria-label="저장되는 비트">
              {stream.join(" ")}
            </p>
          </>
        )}
      </section>

      <section className="concepts" aria-labelledby="encode-concept-title">
        <h2 id="encode-concept-title">글자는 어떻게 0과 1이 될까?</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>글자마다 번호를 약속한다</h3>
            <p>
              컴퓨터는 글자 모양을 모릅니다. 그래서 A는 65, B는 66처럼 글자마다 번호(코드)를 정한
              코드표를 함께 쓰고, 그 번호를 이진수로 저장합니다. 영어 알파벳·숫자·기호를 담은
              코드표가 ASCII입니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>128글자로는 모자라다</h3>
            <p>
              ASCII는 7비트로 0~127, 128글자만 담습니다. 한글·한자·이모지까지 담으려고 세계의 글자에
              번호를 붙인 코드표가 유니코드이고, 한글 한 글자는 보통 3바이트로 저장됩니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}
