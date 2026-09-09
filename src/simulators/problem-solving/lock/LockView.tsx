import { formatCode, lockLimit, type LockState } from "./engine"

function elapsed(attempts: number) {
  const seconds = attempts * 3
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  if (hours) return `${hours}시간 ${minutes}분`
  if (minutes) return `${minutes}분 ${rest}초`
  return `${rest}초`
}

export function LockView({ state }: { state: LockState }) {
  const total = lockLimit(state.digits)
  const code = formatCode(state.current, state.digits)
  return (
    <section className={`ps-card lock-scene ${state.finished ? "is-open" : ""}`}>
      <div className="ps-section-title">
        <div>
          <p className="ps-kicker">시행착오 방법</p>
          <h2>0부터 하나씩 돌려 보기</h2>
        </div>
        <span className="strategy-chip lock-chip">반드시 찾음</span>
      </div>
      <dl className="ps-stats">
        <div>
          <dt>시도 횟수</dt>
          <dd>{state.attempts.toLocaleString()}회</dd>
        </div>
        <div>
          <dt>남은 경우의 수</dt>
          <dd>{Math.max(0, total - state.attempts).toLocaleString()}개</dd>
        </div>
        <div>
          <dt>한 번에 3초라면</dt>
          <dd>{elapsed(state.attempts)}</dd>
        </div>
      </dl>
      <div className="lock-visual" aria-label={`현재 자물쇠 숫자 ${code}`}>
        <div className="lock-shackle" />
        <div className="lock-body">
          <div className="lock-dials">
            {code.split("").map((digit, index) => (
              <span className="lock-dial" key={index}>
                {digit}
              </span>
            ))}
          </div>
        </div>
      </div>
      <label className="ps-progress-label">
        전체 경우 중 확인한 비율
        <progress max={total} value={state.attempts} />
        <span>{((state.attempts / total) * 100).toFixed(state.digits >= 3 ? 1 : 0)}%</span>
      </label>
      <p className="ps-result" role="status" aria-live="polite">
        {state.finished
          ? `${formatCode(state.secret, state.digits)}에서 열렸습니다. ${state.attempts.toLocaleString()}회 시도했습니다.`
          : state.attempts
            ? `${formatCode(state.current - 1, state.digits)}까지 확인했지만 아직 열리지 않았습니다.`
            : "다음 단계를 눌러 0부터 시도하세요."}
      </p>
    </section>
  )
}
