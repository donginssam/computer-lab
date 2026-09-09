export interface SpeedChoice {
  label: string
  speed: number
  batch: number
}

const standardSpeeds: readonly SpeedChoice[] = [
  { label: "빠름 (0.4초)", speed: 400, batch: 1 },
  { label: "보통 (0.8초)", speed: 800, batch: 1 },
  { label: "느림 (1.5초)", speed: 1500, batch: 1 },
]

/**
 * 실행 제어는 두 시뮬레이터가 같지만 상태 구조는 다르므로, 액션 대신
 * 콜백을 받아 어떤 reducer 위에서도 그대로 쓰인다.
 */
export function RunControls({
  running,
  done,
  tick,
  speed,
  batch = 1,
  speeds = standardSpeeds,
  onStep,
  onBack,
  onReset,
  onToggle,
  onSpeed,
}: {
  running: boolean
  done: boolean
  tick: number
  speed: number
  batch?: number
  speeds?: readonly SpeedChoice[]
  onStep: () => void
  onBack: () => void
  onReset: () => void
  onToggle: () => void
  onSpeed: (speed: number, batch: number) => void
}) {
  return (
    <section className="sim-card run-controls" aria-label="실행 제어">
      <label>
        진행 속도{" "}
        <select
          value={`${speed}:${batch}`}
          onChange={event => {
            const [nextSpeed, nextBatch] = event.target.value.split(":").map(Number)
            onSpeed(nextSpeed, nextBatch)
          }}
        >
          {speeds.map(choice => (
            <option
              key={`${choice.speed}:${choice.batch}`}
              value={`${choice.speed}:${choice.batch}`}
            >
              {choice.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onReset}>
        처음부터
      </button>
      <button type="button" disabled={!tick} onClick={onBack}>
        ◀ 이전
      </button>
      <button type="button" disabled={done || running} onClick={onStep}>
        다음 단계 ▶
      </button>
      <button type="button" className="primary" disabled={done} onClick={onToggle}>
        {running ? "Ⅱ 일시 정지" : "▶ 자동 실행"}
      </button>
      <p className="small-note">
        단축키: Space 다음 단계 · R 처음부터 · A 자동 실행/정지 (입력 칸이나 버튼을 클릭한 상태가
        아닐 때)
      </p>
    </section>
  )
}
