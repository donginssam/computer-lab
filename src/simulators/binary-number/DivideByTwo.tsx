import { useMemo } from "react"
import { Quiz } from "../shared/Quiz"
import { NumberField } from "../shared/NumberField"
import { RunControls } from "../shared/RunControls"
import { StepLog } from "../shared/StepLog"
import { useStepRun } from "../shared/useStepRun"
import { spacedBits } from "../shared/digits"
import { divisionRows, readRemainders, UNSIGNED_MAX } from "./engine"

const questions = [
  {
    text: "나머지를 모아 이진수를 만들 때는 어느 쪽부터 읽을까요?",
    options: ["맨 위 나머지부터", "맨 아래 나머지부터", "아무 쪽이나"],
    answer: 1,
    why: "맨 처음 나온 나머지가 1의 자리입니다. 가장 큰 자리는 마지막에 나오므로 아래에서 위로 읽습니다.",
  },
  {
    text: "2로 나눈 나머지가 0이면 원래 수는?",
    options: ["짝수", "홀수", "알 수 없다"],
    answer: 0,
    why: "나머지가 1의 자리 비트입니다. 짝수는 1의 자리 비트가 항상 0입니다.",
  },
] as const

export function DivideByTwo({
  number,
  change,
  openCards,
}: {
  number: number
  change: (updates: Record<string, string>) => void
  openCards: (target: number) => void
}) {
  const rows = useMemo(() => divisionRows(number), [number])
  // 나눗셈 줄마다 한 단계, 마지막에 나머지를 거꾸로 읽는 한 단계가 더 있다.
  // 바꿀 수가 바뀌면 처음부터 다시 나눈다.
  const { tick, done: reading, controls } = useStepRun(rows.length + 1, number)
  const shownRows = rows.slice(0, tick)
  const answer = readRemainders(rows)

  const log = [
    ...shownRows.map(row => `${row.dividend} ÷ 2 = ${row.quotient} … 나머지 ${row.remainder}`),
    ...(reading ? [`몫이 0이 되었으니 나머지를 아래에서 위로 읽습니다 → ${answer}`] : []),
  ]

  return (
    <>
      <section className="sim-card sim-settings" aria-label="2로 나누기 설정">
        <NumberField
          label="바꿀 수"
          value={number}
          min={1}
          max={UNSIGNED_MAX}
          onCommit={next => change({ d: String(next) })}
        />
        <button
          type="button"
          onClick={() => change({ d: String(Math.floor(Math.random() * UNSIGNED_MAX) + 1) })}
        >
          무작위 수
        </button>
        <p className="small-note">
          몫이 0이 될 때까지 2로 나누고, 나머지를 모아 이진수를 만듭니다. 수를 바꾸면 처음부터 다시
          시작합니다.
        </p>
      </section>

      <RunControls {...controls} />

      <section className="sim-card" aria-label="2로 나누기 과정">
        <div className="division-ladder">
          <ol className="division-rows" aria-label="나눗셈 줄">
            {shownRows.map((row, index) => (
              <li
                key={row.dividend}
                className={index === shownRows.length - 1 && !reading ? "latest" : ""}
              >
                <span className="division-divisor" aria-hidden="true">
                  2 )
                </span>
                <span className="division-dividend">{row.dividend}</span>
                <span className="division-remainder">
                  <span className="sr-only">나머지</span>
                  {row.remainder}
                </span>
              </li>
            ))}
            {shownRows.length > 0 && (
              <li className="division-final">
                <span className="division-divisor" aria-hidden="true" />
                <span className="division-dividend">{shownRows.at(-1)!.quotient}</span>
                <span className="division-remainder" aria-hidden="true" />
              </li>
            )}
          </ol>
          {reading && (
            <p className="division-arrow" aria-hidden="true">
              ↑<br />
              아래에서 위로
            </p>
          )}
        </div>
        <p className="result" role="status" aria-live="polite">
          {reading
            ? `★ ${number}을 이진수로 쓰면 ${answer}입니다.`
            : tick === 0
              ? `${number}을 2로 나누는 것부터 시작합니다. 다음 단계를 눌러 보세요.`
              : `몫 ${shownRows.at(-1)!.quotient}${shownRows.at(-1)!.quotient ? "을 다시 2로 나눕니다." : "이 되었습니다. 이제 나머지를 읽을 차례입니다."}`}
        </p>
        {reading && (
          <div className="division-check">
            <p>
              확인: {spacedBits(answer.padStart(8, "0"))}의 켜진 자릿값을 더하면{" "}
              {[...answer]
                .map((bit, i) => (bit === "1" ? 2 ** (answer.length - 1 - i) : 0))
                .filter(Boolean)
                .join(" + ")}{" "}
              = {number}
            </p>
            <button type="button" onClick={() => openCards(number)}>
              자릿값 카드로 확인하기
            </button>
          </div>
        )}
        <StepLog entries={log} empty="다음 단계를 눌러 첫 나눗셈을 시작하세요." />
      </section>

      <section className="concepts" aria-labelledby="divide-concept-title">
        <h2 id="divide-concept-title">왜 나머지를 거꾸로 읽을까?</h2>
        <div className="concept-grid">
          <article className="sim-card">
            <h3>나머지가 곧 1의 자리</h3>
            <p>
              2로 나눈 나머지는 그 수가 홀수인지 짝수인지, 즉 1의 자리 비트를 알려 줍니다. 몫을 다시
              2로 나누면 그다음 자리(2의 자리) 비트가 나옵니다. 작은 자리부터 나오므로 거꾸로
              읽습니다.
            </p>
          </article>
          <article className="sim-card">
            <h3>카드와 같은 답</h3>
            <p>
              자릿값 카드는 큰 자리부터, 2로 나누기는 작은 자리부터 정합니다. 방향은 반대지만 같은
              수라면 언제나 같은 이진수가 나옵니다.
            </p>
          </article>
        </div>
        <Quiz questions={questions} />
      </section>
    </>
  )
}
