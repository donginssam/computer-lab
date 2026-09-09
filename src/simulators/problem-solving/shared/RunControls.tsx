import type { Dispatch } from "react"
import type { StepAction } from "./stepper"

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

export function RunControls({
  running,
  done,
  tick,
  speed,
  batch,
  speeds = standardSpeeds,
  dispatch,
  step,
  reset,
  onSpeedChange,
}: {
  running: boolean
  done: boolean
  tick: number
  speed: number
  batch: number
  speeds?: readonly SpeedChoice[]
  dispatch: Dispatch<StepAction>
  step: () => void
  reset: () => void
  onSpeedChange?: (speed: number, batch: number) => void
}) {
  const value = `${speed}:${batch}`
  return (
    <section className="ps-card ps-run-controls" aria-label="실행 제어">
      <label>
        진행 속도{" "}
        <select
          value={value}
          onChange={event => {
            const [nextSpeed, nextBatch] = event.target.value.split(":").map(Number)
            dispatch({ type: "speed", speed: nextSpeed, batch: nextBatch })
            onSpeedChange?.(nextSpeed, nextBatch)
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
      <button type="button" onClick={reset}>
        처음부터
      </button>
      <button type="button" disabled={!tick} onClick={() => dispatch({ type: "back" })}>
        ◀ 이전
      </button>
      <button type="button" disabled={done || running} onClick={step}>
        다음 단계 ▶
      </button>
      <button
        type="button"
        className="primary"
        disabled={done}
        onClick={() => dispatch({ type: "auto", running: !running })}
      >
        {running ? "Ⅱ 일시 정지" : "▶ 자동 실행"}
      </button>
      <p className="ps-note">
        단축키: Space 다음 단계 · R 처음부터 · A 자동 실행/정지 (입력 칸이나 버튼을 클릭한 상태가
        아닐 때)
      </p>
    </section>
  )
}
