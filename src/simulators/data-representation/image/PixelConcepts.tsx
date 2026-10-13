import { Quiz } from "../../shared/Quiz"

const questions = [
  {
    text: "그림의 가로와 세로 픽셀 수를 모두 2배로 늘리면 픽셀 수는?",
    options: ["2배", "4배", "8배"],
    answer: 1,
    why: "가로 2배 × 세로 2배 = 4배입니다. 8×8 = 64픽셀이 16×16 = 256픽셀이 됩니다.",
  },
  {
    text: "흑백(1비트) 8×8 그림은 몇 바이트일까요?",
    options: ["8바이트", "64바이트", "192바이트"],
    answer: 0,
    why: "64픽셀 × 1비트 = 64비트이고, 8비트가 1바이트이므로 8바이트입니다.",
  },
  {
    text: "같은 8×8 그림을 흑백 대신 24비트 색으로 저장하면 용량은?",
    options: ["같다", "3배", "24배"],
    answer: 2,
    why: "픽셀 하나에 1비트 대신 24비트를 쓰므로 전체 용량도 24배가 됩니다.",
  },
] as const

export function PixelConcepts() {
  return (
    <section className="concepts" aria-labelledby="pixel-concept-title">
      <h2 id="pixel-concept-title">그림 한 장의 크기는 어떻게 정해질까?</h2>
      <div className="concept-grid">
        <article className="sim-card">
          <h3>해상도: 픽셀이 몇 개인가</h3>
          <p>
            가로와 세로의 픽셀 수를 해상도라고 합니다. 픽셀이 많을수록 그림이 더 자세해지지만,
            저장할 픽셀도 그만큼 많아집니다.
          </p>
        </article>
        <article className="sim-card">
          <h3>색 깊이: 픽셀 하나에 몇 비트인가</h3>
          <p>
            흑백은 1비트, 흔히 쓰는 트루컬러는 24비트입니다. 그림 전체의 비트 수는 픽셀 수 × 색
            깊이이므로, 해상도나 색 깊이를 늘리면 용량이 커집니다.
          </p>
        </article>
      </div>
      <Quiz questions={questions} />
    </section>
  )
}
