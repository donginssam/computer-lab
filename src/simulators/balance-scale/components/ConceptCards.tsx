import { useState } from "react"
const questions = [
  {
    text: "N=64를 128로 늘리면 절반씩 나누기의 최악 횟수는?",
    options: ["2배가 된다", "1회 늘어난다", "변하지 않는다"],
    answer: 1,
    why: "64 → 32 → … → 1은 6회, 128 → 64 → … → 1은 7회입니다.",
  },
  {
    text: "상자 7개에서 3개씩 비교했는데 균형이라면?",
    options: ["저울 밖 1개가 정답", "다시 같은 상자를 비교", "정답을 알 수 없다"],
    answer: 0,
    why: "불량은 딱 하나입니다. 양쪽 무게가 같으므로 저울 밖 상자가 가볍습니다.",
  },
  {
    text: "상자 1000개를 이 방식으로 절반씩 나누면 최악 몇 회일까요?",
    options: ["500회", "10회", "9회"],
    answer: 2,
    why: "1000 → 500 → 250 → 125 → 62 → 31 → 15 → 7 → 3 → 1: 9회입니다. 10회는 올림한 느슨한 상한입니다.",
  },
]
export function ConceptCards() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  return (
    <section className="concepts">
      <h2>왜 이런 차이가 날까?</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>한 번에 줄이는 후보 수</h3>
          <p>
            순차 비교는 균형일 때 2개를 제외합니다. 절반씩 나누기는 가벼운 쪽의 절반만 남깁니다.
            홀수에서 균형이면 밖의 1개가 바로 정답입니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>N이 두 배가 되면?</h3>
          <table>
            <thead>
              <tr>
                <th>N</th>
                <th>순차</th>
                <th>절반</th>
              </tr>
            </thead>
            <tbody>
              {[8, 16, 32, 64, 128].map(n => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{n / 2}회</td>
                  <td>{Math.log2(n)}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="sim-card">
          <h3>O(N)과 O(log N)</h3>
          <p>
            상자가 많아질 때 필요한 작업이 얼마나 빠르게 늘어나는지 나타내는 표기입니다. 순차는 상자
            수에 비례하고, 절반 나누기는 훨씬 천천히 늘어납니다.
          </p>
          <p className="small-note">
            참고 용어이며 평가 범위는 아닙니다. 무작위 정답은 운 좋게 일찍 찾을 수도 있습니다.
          </p>
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
      <details className="sim-card">
        <summary>교사용 안내 · 수업 흐름 제안</summary>
        <ol className="teacher-guide">
          <li>상자 중 딱 하나만 가볍다는 조건을 확인하고 비교 횟수를 예상합니다.</li>
          <li>N=7로 순차 비교와 절반 나누기를 한 단계씩 시연합니다.</li>
          <li>나란히 비교에서 같은 불량 위치라는 조건을 확인합니다.</li>
          <li>N=8, 16, 32, 64의 기록과 그래프를 보고 증가량을 설명합니다.</li>
          <li>직접 해보기로 전략을 세운 뒤 정리 질문과 3등분 힌트로 마무리합니다.</li>
        </ol>
      </details>
    </section>
  )
}
