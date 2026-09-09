import { Quiz } from "../../shared/Quiz"

const questions = [
  {
    text: "비밀번호가 0000이면 몇 번 만에 열릴까요?",
    options: ["1번", "4번", "10번"],
    answer: 0,
    why: "첫 번째로 0000을 시도하므로 1번 만에 열립니다.",
  },
  {
    text: "6자리 자물쇠를 한 번에 3초씩 돌리면 최대 얼마나 걸릴까요?",
    options: ["약 35일", "약 3일", "약 347일"],
    answer: 0,
    why: "1,000,000번에 3초씩이면 3,000,000초, 약 34일 17시간 20분입니다.",
  },
] as const

export function LockConcept() {
  return (
    <section className="concepts" aria-labelledby="lock-concept-title">
      <h2 id="lock-concept-title">왜 반드시 찾지만 오래 걸릴까?</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>가능한 답을 하나씩 모두 확인</h3>
          <p>
            시행착오 방법은 빠뜨리지 않고 차례로 시도합니다. 답이 가능한 범위 안에 있다면 언젠가는
            반드시 찾습니다. 앞에서 확인한 답을 다시 볼 필요도 없습니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>자릿수 하나가 만드는 10배</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">자릿수</th>
                <th scope="col">경우의 수</th>
                <th scope="col">가장 많이 걸려도</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(digits => (
                <tr key={digits}>
                  <td>{digits}자리</td>
                  <td>{(10 ** digits).toLocaleString()}개</td>
                  <td>{(10 ** digits).toLocaleString()}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
      <Quiz questions={questions} />
    </section>
  )
}
