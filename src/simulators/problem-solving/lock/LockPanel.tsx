import { formatCode, lockLimit } from "./engine"

export type LockPlacement = "worst" | "random" | "manual"

export function LockPanel({
  digits,
  placement,
  manualSecret,
  change,
  setManualSecret,
}: {
  digits: 1 | 2 | 3 | 4
  placement: LockPlacement
  manualSecret: number
  change: (updates: Record<string, string>) => void
  setManualSecret: (secret: number) => void
}) {
  return (
    <section className="ps-card ps-settings" aria-label="자물쇠 실험 설정">
      <label>
        자릿수{" "}
        <select value={digits} onChange={event => change({ d: event.target.value })}>
          {[1, 2, 3, 4].map(value => (
            <option value={value} key={value}>
              {value}자리
            </option>
          ))}
        </select>
      </label>
      <label>
        비밀번호 위치{" "}
        <select value={placement} onChange={event => change({ pos: event.target.value })}>
          <option value="worst">가장 늦게 찾는 곳</option>
          <option value="random">무작위</option>
          <option value="manual">직접 입력</option>
        </select>
      </label>
      {placement === "manual" && (
        <label>
          직접 입력한 비밀번호{" "}
          <input
            aria-label="직접 입력한 비밀번호"
            inputMode="numeric"
            maxLength={digits}
            key={`${digits}:${manualSecret}`}
            defaultValue={formatCode(manualSecret, digits)}
            onBlur={event => {
              const parsed = Number(event.target.value.replace(/\D/g, ""))
              const secret = Math.max(0, Math.min(lockLimit(digits) - 1, parsed || 0))
              event.currentTarget.value = formatCode(secret, digits)
              setManualSecret(secret)
            }}
            onKeyDown={event => {
              if (event.key === "Enter") event.currentTarget.blur()
            }}
          />
        </label>
      )}
      <p className="ps-note">
        0부터 차례로 시도합니다. 비밀번호는 실험이 끝날 때까지 장면에 표시하지 않습니다. 직접 입력한
        값은 주소에 저장하지 않습니다.
      </p>
    </section>
  )
}
