import { DIGIT_MAX, DIGIT_MIN } from "../bounds"
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
  if (!Number.isInteger(options.digits) || options.digits < DIGIT_MIN || options.digits > DIGIT_MAX)
    throw new RangeError(`자릿수는 ${DIGIT_MIN}~${DIGIT_MAX}여야 합니다.`)
  if (!Number.isInteger(secret) || secret < 0 || secret >= lockLimit(options.digits))
    throw new RangeError("비밀번호가 자릿수 범위를 벗어났습니다.")
}

/** 장면과 단계 기록에 남기는 최근 시도 수. step과 back이 같은 값을 써야 되감은 결과가 같다. */
const RECENT_ATTEMPTS = 20

function recentAttempts(attempts: number) {
  return Array.from(
    { length: Math.min(attempts, RECENT_ATTEMPTS) },
    (_, index) => Math.max(0, attempts - RECENT_ATTEMPTS) + index,
  )
}

export const lockEngine: StepEngine<LockOptions, LockState> = {
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
      recent: [...state.recent, attempted].slice(-RECENT_ATTEMPTS),
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
