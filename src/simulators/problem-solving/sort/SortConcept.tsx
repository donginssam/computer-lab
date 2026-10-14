import { Quiz } from "../../shared/Quiz"

const questions = [
  {
    text: "시험지 30장을 번호에 따라 세 묶음으로 나눌 때, 시험지끼리의 비교는 몇 회일까요?",
    options: ["0회", "30회", "45회"],
    answer: 0,
    why: "각 번호가 어느 범위에 속하는지만 확인합니다. 두 시험지를 서로 비교하는 과정은 없으므로 비교 횟수는 0회입니다.",
  },
  {
    text: "10장 묶음에서 가장 작은 번호를 한 장씩 찾는 데 45회 비교한다면, 세 묶음은 모두 몇 회일까요?",
    options: ["45회", "90회", "135회"],
    answer: 2,
    why: "10장씩 세 묶음을 같은 방법으로 정리하므로 45 × 3 = 135회입니다.",
  },
  {
    text: "각 묶음 안의 정리가 끝났다면, 어떻게 합칠까요?",
    options: [
      "1~10 → 11~20 → 21~30번 순서로 붙인다",
      "30장을 다시 모두 비교한다",
      "정리된 묶음을 다시 섞는다",
    ],
    answer: 0,
    why: "번호 범위가 겹치지 않으므로 작은 번호의 묶음부터 붙이면 됩니다. 추가로 시험지끼리 비교할 필요가 없습니다.",
  },
] as const

export function SortConcept() {
  return (
    <section className="concepts exam-concepts" aria-labelledby="sort-concept-title">
      <h2 id="sort-concept-title">작은 문제의 답을 모으면, 전체 문제의 답이 된다</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>① 번호를 보고 나누기</h3>
          <p>
            시험지 30장을 1~10번, 11~20번, 21~30번으로 나눕니다. 번호가 어느 범위에 속하는지만
            확인하므로 시험지끼리의 비교는 0회입니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>② 작은 묶음마다 정리하기</h3>
          <p>
            각 묶음에서 가장 작은 번호를 한 장씩 찾아 정리합니다. 10장은 9 + 8 + … + 1 = 45회, 세
            묶음은 모두 135회 비교합니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>③ 순서대로 이어 붙이기</h3>
          <p>
            정리된 1~10번 뒤에 11~20번, 그 뒤에 21~30번을 붙입니다. 앞 묶음의 모든 번호가 뒤
            묶음보다 작으므로 추가 비교 없이 완성됩니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>비교와 이동은 구분해요</h3>
          <p>
            시험지 두 장의 번호를 서로 확인할 때만 비교 횟수를 셉니다. 시험지를 묶음으로 나누거나,
            정리한 줄로 옮기거나, 묶음을 이어 붙이는 일은 비교 횟수에 포함하지 않습니다.
          </p>
        </article>
      </div>
      <Quiz questions={questions} />
    </section>
  )
}
