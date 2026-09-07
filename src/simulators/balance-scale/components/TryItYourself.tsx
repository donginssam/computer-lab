import { useState } from "react"
import { tilt } from "../engine/core"
import type { Weighing } from "../engine/types"
import { optimalGuaranteed, divideMax } from "../engine/theory"
import { resultLabel } from "../copy"
import { BalanceScale } from "./BalanceScale"
export function TryItYourself({ n }: { n: number }) {
  const [fake, setFake] = useState(() => Math.floor(Math.random() * n))
  const [places, setPlaces] = useState<number[]>(() => Array(n).fill(0))
  const [target, setTarget] = useState(1)
  const [history, setHistory] = useState<Weighing[]>([])
  const [guess, setGuess] = useState(0)
  const [finished, setFinished] = useState(false)
  const [message, setMessage] = useState("같은 수의 상자를 양쪽에 올려 비교하세요.")
  const [hint, setHint] = useState(0)
  const left = places.flatMap((p, i) => (p === 1 ? [i] : []))
  const right = places.flatMap((p, i) => (p === 2 ? [i] : []))
  const outside = places.flatMap((p, i) => (p === 0 ? [i] : []))
  function weigh() {
    if (finished || !left.length || left.length !== right.length) return
    const result = tilt(left, right, fake)
    setHistory(h => [...h, { left, right, outside, result }])
    setMessage(`${history.length + 1}번째: ${resultLabel[result]}`)
  }
  return (
    <section className="sim-card">
      <div className="section-title">
        <h2>직접 전략을 세워 보세요</h2>
        <button
          onClick={() => {
            setFake(Math.floor(Math.random() * n))
            setPlaces(Array(n).fill(0))
            setHistory([])
            setFinished(false)
            setHint(0)
            setMessage("새 문제입니다. 상자를 배치하세요.")
          }}
        >
          새 문제
        </button>
      </div>
      <p>
        보낼 곳을 선택한 뒤 상자를 누르세요. 이미 그곳에 있는 상자를 누르면 저울 밖으로 돌아옵니다.
      </p>
      <fieldset disabled={finished}>
        <legend>상자를 보낼 곳</legend>
        <div className="button-row">
          {["저울 밖", "왼쪽 접시", "오른쪽 접시"].map((label, i) => (
            <button key={label} aria-pressed={target === i} onClick={() => setTarget(i)}>
              {label}
            </button>
          ))}
        </div>
        <div className="box-grid manual-boxes">
          {places.map((p, i) => (
            <button
              key={i}
              aria-label={`${i + 1}번, ${["저울 밖", "왼쪽", "오른쪽"][p]}`}
              className={p ? "active" : ""}
              onClick={() => {
                setPlaces(old => old.map((v, j) => (j === i ? (v === target ? 0 : target) : v)))
                setMessage("배치가 바뀌었습니다. 저울질을 눌러 결과를 확인하세요.")
              }}
            >
              {i + 1}
              <small>{["밖", "왼쪽", "오른쪽"][p]}</small>
            </button>
          ))}
        </div>
        <div className="button-row">
          <button
            className="primary"
            disabled={!left.length || left.length !== right.length}
            onClick={weigh}
          >
            저울질 ({history.length}회 사용)
          </button>
          <button
            onClick={() => {
              setPlaces(Array(n).fill(0))
              setMessage("접시를 비웠습니다.")
            }}
          >
            접시 비우기
          </button>
        </div>
      </fieldset>
      <p className="small-note">
        왼쪽 {left.length}개 / 오른쪽 {right.length}개 · 양쪽에 같은 수를 1개 이상 올려야 합니다.
      </p>
      <BalanceScale
        weighing={{
          left,
          right,
          outside,
          result:
            history.length &&
            history.at(-1)!.left.join() === left.join() &&
            history.at(-1)!.right.join() === right.join()
              ? history.at(-1)!.result
              : "balanced",
        }}
      />
      <p role="status" className="result">
        {message}
      </p>
      <div className="button-row">
        <label>
          정답 예상{" "}
          <select
            disabled={finished}
            value={guess}
            onChange={e => setGuess(Number(e.target.value))}
          >
            {places.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}번
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={finished}
          onClick={() => {
            if (guess === fake) {
              setFinished(true)
              setMessage(
                `★ 정답! ${fake + 1}번입니다. ${history.length}회 사용했습니다. ${history.length <= optimalGuaranteed(n) ? "훌륭해요!" : "정답을 찾았어요. 후보를 세 묶음으로 나누면 더 줄일 수 있어요."}`,
              )
            } else setMessage("아직 정답이 아닙니다. 저울 결과를 다시 살펴보세요.")
          }}
        >
          이 상자가 정답!
        </button>
        <button onClick={() => setHint(h => Math.min(3, h + 1))}>힌트 ({hint}/3)</button>
      </div>
      {hint > 0 && (
        <p className="hint">
          {
            [
              "",
              "후보를 크기가 비슷한 세 묶음으로 나눠 보세요.",
              "같은 수의 두 묶음을 비교하세요. 균형이면 저울 밖 묶음에 정답이 있습니다.",
              "가벼운 묶음(균형이면 밖의 묶음)만 후보로 남기고 반복하세요. 이미 정상인 상자를 수 맞추기에 쓸 수도 있어요.",
            ][hint]
          }
        </p>
      )}
      <p className="small-note">
        절반 나누기 최악 {divideMax(n)}회 · 최적 전략의 보장 횟수 ⌈log₃N⌉ = {optimalGuaranteed(n)}
        회. 이는 모든 위치에서 정답을 보장하는 기준이며, 운 좋게 더 일찍 찾을 수도 있습니다.
      </p>
      <details>
        <summary>내 저울질 기록 ({history.length})</summary>
        <ol>
          {history.map((w, i) => (
            <li key={i}>
              {i + 1}. 왼쪽 {w.left.map(id => id + 1).join("·")} / 오른쪽{" "}
              {w.right.map(id => id + 1).join("·")} → {resultLabel[w.result]}
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}
