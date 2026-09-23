/**
 * 주소의 파라미터와 설정 패널의 입력칸이 함께 쓰는 값 읽기. 두 입구가 같은
 * 함수를 지나야, 같은 값을 넣었을 때 어느 쪽으로 넣든 같은 결과가 나온다.
 */

/**
 * `Number(null)` and `Number("")` are both 0, so an absent parameter has to be
 * rejected before parsing — otherwise every default collapses to the minimum.
 */
export function numericParam(value: string | null | undefined) {
  if (value === null || value === undefined || value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** 값이 없거나 숫자가 아니면 기본값을, 숫자면 clamp로 범위를 맞춘 값을 쓴다. */
export function clampedParam<T>(
  value: string | null | undefined,
  fallback: T,
  clamp: (value: number) => T,
) {
  const parsed = numericParam(value)
  return parsed === null ? fallback : clamp(parsed)
}

export function oneOfParam<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export function clampInteger(value: number, min: number, max: number) {
  return Math.trunc(Math.max(min, Math.min(max, value)))
}
