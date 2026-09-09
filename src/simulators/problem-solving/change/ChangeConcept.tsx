import { Quiz } from "../../shared/Quiz"

const questions = [
  {
    text: "100·60·10원 동전으로 180원을 만들면 욕심쟁이 방법은 몇 개를 쓸까요?",
    options: ["2개", "3개", "4개"],
    answer: 2,
    why: "100원, 60원, 10원, 10원 순서로 골라 4개를 씁니다. 60원 세 개면 3개로 만들 수 있습니다.",
  },
  {
    text: "욕심쟁이 방법의 결과는 언제나 가장 적은 개수일까요?",
    options: ["언제나 그렇다", "동전 종류에 따라 다르다", "언제나 더 많다"],
    answer: 1,
    why: "한국 동전에서는 잘 맞지만 실험용 동전에서는 더 많이 쓰거나 중간에 막힐 수 있습니다.",
  },
] as const

export function ChangeConcept() {
  return (
    <section className="concepts" aria-labelledby="change-concept-title">
      <h2 id="change-concept-title">지금 가장 좋아 보이는 선택이 끝에도 좋을까?</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>한 번 고르면 뒤돌아보지 않기</h3>
          <p>
            욕심쟁이 방법은 그 순간 고를 수 있는 가장 큰 동전을 택합니다. 규칙이 단순해서 매 단계의
            계산이 적지만, 먼저 고른 동전을 나중에 바꾸지 않습니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>동전 종류가 결과를 바꾼다</h3>
          <p>
            120원을 100·60·10원 동전으로 만들면 욕심쟁이는 100+10+10으로 3개를 씁니다. 60+60은 2개면
            됩니다. 같은 방법도 문제의 조건에 따라 잘 맞거나 맞지 않을 수 있습니다.
          </p>
        </article>
      </div>
      <Quiz questions={questions} />
    </section>
  )
}
