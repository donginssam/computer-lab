import { Quiz } from "../shared/Quiz"

const questions = [
  {
    text: "카드 8장을 한 장씩 될 때까지 나누면 나누기는 모두 몇 번일까요?",
    options: ["3번", "7번", "8번"],
    answer: 1,
    why: "8장을 8개의 한 장 묶음으로 만들려면 묶음을 7번 나눕니다.",
  },
  {
    text: "정리된 [3, 8]과 [5, 6]을 합칠 때 먼저 비교할 카드는?",
    options: ["3과 5", "8과 6", "3과 6"],
    answer: 0,
    why: "정리된 묶음은 맨 앞의 가장 작은 카드끼리 비교하면 됩니다.",
  },
  {
    text: "카드 8장을 거꾸로 놓으면 가장 많은 비교 횟수인 17회가 필요할까요?",
    options: ["17회가 필요하다", "12회로 더 적다", "17회보다 많이 필요하다"],
    answer: 1,
    why: "한쪽 묶음이 일찍 비어 남은 카드를 비교 없이 옮길 수 있으므로 12회만 비교합니다.",
  },
] as const

export function SortConcept() {
  return (
    <section className="ps-concepts" aria-labelledby="sort-concept-title">
      <h2 id="sort-concept-title">작은 문제의 답을 어떻게 다시 모을까?</h2>
      <div className="ps-concept-grid">
        <article className="ps-card">
          <h3>한 장은 이미 정리되어 있다</h3>
          <p>
            카드 묶음을 반으로 계속 나누면 한 장짜리 묶음이 됩니다. 한 장에는 순서를 바꿀 일이
            없으므로 이미 정리된 작은 문제입니다.
          </p>
        </article>
        <article className="ps-card">
          <h3>정리된 두 묶음은 앞끼리 비교</h3>
          <p>
            두 묶음의 맨 앞 카드 중 작은 것을 새 줄에 놓는 일을 반복하면 전체가 정리됩니다. 하나씩
            차례로 비교하며 정리하면 최대 N(N−1)/2회가 들지만, 합병 정렬은 훨씬 적게 비교합니다.
          </p>
        </article>
        <article className="ps-card">
          <h3>거꾸로가 가장 어렵지는 않다</h3>
          <p>
            8장 거꾸로 순서는 12회 비교하지만 가장 많이 비교하는 순서는 17회입니다. 두 묶음의 값이
            번갈아 나오면 어느 한쪽도 빨리 비지 않아 비교가 더 오래 이어집니다.
          </p>
        </article>
        <article className="ps-card">
          <h3>양팔저울의 나누기와 다른 점</h3>
          <p>
            양팔저울 실험은 답이 있는 한쪽만 계속 살폈습니다. 여기서는 나눈 양쪽을 모두 정리한 뒤
            합쳐야 큰 문제의 답이 완성됩니다.
          </p>
        </article>
      </div>
      <Quiz
        questions={questions.map(question => ({ ...question, options: [...question.options] }))}
      />
    </section>
  )
}
