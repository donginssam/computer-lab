import { groupLabel, type ExamDivideState } from "./exam"
import { ExamMethodHeader, ExamPapers } from "./ExamPapers"

export function SortView({ state }: { state: ExamDivideState }) {
  const current = state.trace[state.index - 1]
  const phase = !current ? 0 : current.kind === "divide" ? 1 : current.kind === "combine" ? 3 : 2
  const combined = state.groups.flatMap(group => group.output)
  return (
    <section
      className="sim-card exam-method"
      data-method="divide"
      aria-label="나누어 해결하기 과정"
    >
      <ExamMethodHeader count={state.comparisons} />
      <ol className="exam-phases" aria-label="시험지 정리 순서">
        {["① 나누기", "② 묶음 정리", "③ 합치기"].map((label, index) => (
          <li
            key={label}
            className={phase === index + 1 ? "current" : phase > index + 1 ? "complete" : ""}
          >
            {label}
          </li>
        ))}
      </ol>
      <p className="exam-status" role="status" aria-live="polite">
        {current?.message ?? "먼저 시험지 번호를 보고 10장씩 작은 묶음으로 나눠 보세요."}
      </p>
      {!current && (
        <div className="exam-tray">
          <p className="exam-row-label">뒤섞인 시험지</p>
          <ExamPapers values={state.papers} />
        </div>
      )}
      <div className="exam-groups" aria-label="번호 범위별 시험지 묶음">
        {state.groups.map((group, index) => (
          <div key={group.first} className={`exam-tray ${group.finished ? "is-complete" : ""}`}>
            <div className="exam-tray-heading">
              <strong>{groupLabel(group)}</strong>
              <span>
                {!current
                  ? "아직 나누지 않음"
                  : group.finished
                    ? `정리 완료 · ${group.comparisons}회`
                    : current.groupIndex === index
                      ? `정리 중 · ${group.comparisons}회`
                      : "아직 섞여 있음"}
              </span>
            </div>
            <ExamPapers
              values={[...group.output, ...group.remaining]}
              sorted={group.output}
              active={current?.groupIndex === index ? current.active : []}
            />
          </div>
        ))}
      </div>
      {state.finished && (
        <div className="exam-tray is-complete">
          <p className="exam-row-label">합쳐서 완성한 줄 · 1번부터 {state.papers.length}번까지</p>
          <ExamPapers values={combined} sorted={combined} />
        </div>
      )}
      <p className="small-note">
        번호를 보고 나누기와 묶음 이어 붙이기는 시험지끼리 비교하지 않습니다.
      </p>
    </section>
  )
}
