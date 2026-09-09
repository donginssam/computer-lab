import type { StepEngine } from "../shared/stepper"

export interface LockOptions {
  digits: 1 | 2 | 3 | 4
}

export interface LockState {
  digits: number
  secret: number
  attempts: number
  current: number
  finished: boolean
  recent: number[]
}

export const lockLimit = (digits: number) => 10 ** digits

export function formatCode(value: number, digits: number) {
  return String(value).padStart(digits, "0")
}

function validate(options: LockOptions, secret: number) {
  if (!Number.isInteger(options.digits) || options.digits < 1 || options.digits > 4)
    throw new RangeError("자릿수는 1~4여야 합니다.")
  if (!Number.isInteger(secret) || secret < 0 || secret >= lockLimit(options.digits))
    throw new RangeError("비밀번호가 자릿수 범위를 벗어났습니다.")
}

function recentAttempts(attempts: number) {
  return Array.from(
    { length: Math.min(attempts, 20) },
    (_, index) => Math.max(0, attempts - 20) + index,
  )
}

export const lockEngine: StepEngine<LockOptions, LockState> = {
  id: "lock",
  name: "시행착오 방법",
  init(options, secret) {
    validate(options, secret)
    return {
      digits: options.digits,
      secret,
      attempts: 0,
      current: 0,
      finished: false,
      recent: [],
    }
  },
  step(state) {
    if (state.finished) return state
    const attempted = state.current
    const finished = attempted === state.secret
    const attempts = state.attempts + 1
    return {
      ...state,
      attempts,
      current: finished ? attempted : attempted + 1,
      finished,
      recent: [...state.recent, attempted].slice(-20),
    }
  },
  back(state) {
    if (!state.attempts) return state
    const attempts = state.attempts - 1
    return {
      ...state,
      attempts,
      current: attempts,
      finished: false,
      recent: recentAttempts(attempts),
    }
  },
  isFinished: state => state.finished,
}
