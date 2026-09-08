import { useState } from "react"
import { algorithms } from "../engine"
const sequential = algorithms["sequential-pair"]
const divide = algorithms["divide-half"]
const questions = [
  {
    text: `동전이 64개에서 128개로 늘어나면, ${divide.name}의 저울질 횟수는 어떻게 될까? (가장 많이 걸리는 경우)`,
    options: ["2배가 된다", "1번 늘어난다", "변하지 않는다"],
    answer: 1,
    why: "64개는 64 → 32 → … → 1로 6번, 128개는 128 → 64 → … → 1로 7번입니다.",
  },
  {
    text: "동전 7개 중 3개씩 저울에 올렸는데 양쪽이 같다면?",
    options: ["저울 밖 1개가 가짜 동전", "같은 동전을 다시 올린다", "알 수 없다"],
    answer: 0,
    why: "가짜 동전은 딱 하나뿐입니다. 저울에 올린 6개는 무게가 같으니, 저울 밖에 있던 1개가 진짜보다 가벼운 가짜 동전입니다.",
  },
]
export function ConceptCards() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  return (
    <section className="concepts">
      <h2>왜 이런 차이가 날까?</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>저울질 한 번에 몇 개를 지울 수 있나?</h3>
          <p>
            {sequential.name}는 양쪽이 같을 때 동전 2개를 후보에서 지웁니다. {divide.name}는 가벼운
            쪽의 절반만 남기니 한 번에 절반을 지웁니다. 동전이 홀수여서 1개가 저울 밖에 남았는데
            양쪽이 같다면, 그 1개가 바로 가짜 동전입니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>동전이 2배가 되면?</h3>
          <table>
            <thead>
              <tr>
                <th>동전 수</th>
                <th>{sequential.shortName}</th>
                <th>{divide.shortName}</th>
              </tr>
            </thead>
            <tbody>
              {[8, 16, 32, 64, 128].map(n => (
                <tr key={n}>
                  <td>{n}개</td>
                  <td>{n / 2}회</td>
                  <td>{Math.log2(n)}회</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small-note">가장 많이 걸려도 이만큼 저울질합니다.</p>
        </article>
      </div>
      <div className="sim-card">
        <h3>생각을 정리해 보세요</h3>
        {questions.map((q, i) => (
          <fieldset className="quiz" key={q.text}>
            <legend>
              {i + 1}. {q.text}
            </legend>
            <div className="button-row">
              {q.options.map((o, j) => (
                <button
                  key={o}
                  aria-pressed={answers[i] === j}
                  onClick={() => setAnswers(a => ({ ...a, [i]: j }))}
                >
                  {o}
                </button>
              ))}
            </div>
            {answers[i] !== undefined && (
              <p role="status">
                {answers[i] === q.answer ? "✓ 맞아요!" : "다시 생각해 보세요."} {q.why}
              </p>
            )}
          </fieldset>
        ))}
      </div>
    </section>
  )
}
