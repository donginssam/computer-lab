import { useState } from "react"
import { blurOnEnter } from "../../shared/blurOnEnter"
import { clampedParam } from "../../shared/params"
import { ProblemBrief } from "../shared/ProblemBrief"
import {
  EXAM_DEFAULT,
  EXAM_MIN,
  EXAM_MAX,
  clampExamCount,
  examOrders,
  examOrderLabels,
  parseExamInput,
  examInputExample,
  type ExamOrder,
} from "./exam"

export function SortPanel({
  n,
  order,
  change,
  setManualCards,
}: {
  n: number
  order: ExamOrder
  change: (updates: Record<string, string>) => void
  setManualCards: (papers: number[] | undefined) => void
}) {
  const [manualText, setManualText] = useState(() => examInputExample(n))
  const [error, setError] = useState("")
  return (
    <>
      <ProblemBrief title="작은 문제의 답을 어떻게 합쳐야 전체 문제가 해결될까?">
        걷어 온 수행평가 시험지 <strong>{n}장</strong>의 번호가 뒤섞였습니다.
        <br />
        <strong>1번부터 {n}번까지 번호 순서대로</strong> 정리해 보세요.
      </ProblemBrief>
      <section
        className="sim-card ps-settings exam-settings"
        aria-label="수행평가 시험지 정리 설정"
      >
        <label>
          시험지 수{" "}
          <input
            type="number"
            min={EXAM_MIN}
            max={EXAM_MAX}
            key={n}
            defaultValue={n}
            onBlur={event => {
              const value = clampedParam(event.target.value, EXAM_DEFAULT, clampExamCount)
              event.currentTarget.value = String(value)
              setManualCards(undefined)
              change({ n: String(value) })
            }}
            onKeyDown={blurOnEnter}
          />
        </label>
        <label>
          시험지 순서{" "}
          <select
            value={order}
            onChange={event => {
              setError("")
              setManualCards(undefined)
              change({ order: event.target.value })
            }}
          >
            {examOrders.map(value => (
              <option value={value} key={value}>
                {examOrderLabels[value]}
              </option>
            ))}
          </select>
        </label>
        {order === "manual" && (
          <label className="ps-wide-field">
            시험지 번호 직접 입력
            <input
              aria-label="시험지 번호 직접 입력"
              value={manualText}
              onChange={event => setManualText(event.target.value)}
              onBlur={() => {
                try {
                  setManualCards(parseExamInput(manualText, n))
                  setError("")
                } catch (caught) {
                  setError(
                    caught instanceof Error ? caught.message : "시험지 번호를 확인해 주세요.",
                  )
                  setManualCards(undefined)
                }
              }}
              onKeyDown={blurOnEnter}
            />
          </label>
        )}
        {error && (
          <p className="sim-error" role="alert">
            {error} 이번 실험은 무작위 순서로 시작합니다.
          </p>
        )}
        <p className="small-note">
          시험지를 작은 묶음으로 나누어 정리합니다. 설정을 바꾸면 새 실험이 시작됩니다.
        </p>
      </section>
    </>
  )
}
