import { useState } from "react"

export interface QuizQuestion {
  text: string
  options: string[]
  answer: number
  why: string
}

export function Quiz({ questions }: { questions: readonly QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  return (
    <section className="ps-card ps-quiz-card">
      <h3>생각을 정리해 보세요</h3>
      {questions.map((question, questionIndex) => (
        <fieldset className="ps-quiz" key={question.text}>
          <legend>
            {questionIndex + 1}. {question.text}
          </legend>
          <div className="ps-button-row">
            {question.options.map((option, optionIndex) => (
              <button
                type="button"
                aria-pressed={answers[questionIndex] === optionIndex}
                onClick={() =>
                  setAnswers(current => ({ ...current, [questionIndex]: optionIndex }))
                }
                key={option}
              >
                {option}
              </button>
            ))}
          </div>
          {answers[questionIndex] !== undefined && (
            <p className="ps-feedback" role="status">
              {answers[questionIndex] === question.answer ? "✓ 맞아요!" : "다시 생각해 보세요."}{" "}
              {question.why}
            </p>
          )}
        </fieldset>
      ))}
    </section>
  )
}
