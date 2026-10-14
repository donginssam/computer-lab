import { Quiz } from "../../shared/Quiz"

const questions = [
  {
    text: "소리를 디지털로 바꾸는 순서로 알맞은 것은?",
    options: ["표본화 → 양자화 → 부호화", "부호화 → 표본화 → 양자화", "양자화 → 부호화 → 표본화"],
    answer: 0,
    why: "먼저 일정한 간격으로 높이를 재고(표본화), 가까운 단계로 맞춘 뒤(양자화), 단계 번호를 이진수로 적습니다(부호화).",
  },
  {
    text: "양자화 비트를 3비트에서 4비트로 늘리면 단계 수는?",
    options: ["4단계 → 5단계", "8단계 → 16단계", "3단계 → 4단계"],
    answer: 1,
    why: "n비트로는 2ⁿ가지를 나타냅니다. 2³ = 8, 2⁴ = 16이므로 단계가 두 배로 촘촘해집니다.",
  },
  {
    text: "양자화 비트는 그대로 두고 표본 수를 2배로 늘리면 데이터 크기는?",
    options: ["그대로", "2배", "4배"],
    answer: 1,
    why: "데이터 크기는 표본 수 × 양자화 비트 수입니다. 표본 수가 2배이면 비트 수도 2배가 됩니다.",
  },
] as const

export function SoundConcepts() {
  return (
    <section className="concepts" aria-labelledby="sound-concept-title">
      <h2 id="sound-concept-title">음질과 용량은 함께 움직인다</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>자주 잴수록(표본화)</h3>
          <p>
            같은 시간 동안 더 자주 재면 빠르게 바뀌는 소리까지 담을 수 있습니다. 음악 CD는 1초에
            44,100번 잽니다. 대신 잰 횟수만큼 저장할 수가 늘어납니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>잘게 나눌수록(양자화)</h3>
          <p>
            단계가 촘촘하면 반올림으로 생기는 차이가 줄어듭니다. 비트를 1개 늘릴 때마다 단계는 2배가
            되지만, 표본 하나를 적는 데 비트가 하나씩 더 듭니다.
          </p>
        </article>
      </div>
      <Quiz questions={questions} />
    </section>
  )
}
