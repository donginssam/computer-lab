import { useId, useState } from "react"
import { blurOnEnter } from "../shared/blurOnEnter"
import { clampedParam, clampInteger } from "../shared/params"

/** 확정한 값이 입력한 값과 달라진 이유. 바뀐 값은 칸에 보이므로 문장에는 기준만 쓴다. */
function adjustment(raw: string, next: number, min: number, max: number) {
  if (raw.trim() === "") return ""
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return ""
  const minWord = min === 1 ? "1로" : `${min}으로`
  if (parsed > max)
    return `입력한 수(${raw})가 너무 커서 ${max}로 바꿨습니다. 8비트로 나타낼 수 있는 가장 큰 수가 ${max}입니다.`
  if (parsed < 0)
    return `음수는 쓸 수 없어서 ${minWord} 바꿨습니다. ${min}~${max} 사이의 정수를 입력해 주세요.`
  if (parsed < min)
    return `${min}보다 작은 수는 쓸 수 없어서 ${minWord} 바꿨습니다. ${min}~${max} 사이의 정수를 입력해 주세요.`
  if (next !== parsed) return "정수만 쓸 수 있어서 소수점 아래를 버렸습니다."
  return ""
}

/**
 * 8비트 범위의 정수 입력칸. 입력 중에는 아무것도 막지 않고, 칸을 벗어나거나 Enter로
 * 확정할 때 범위 안의 정수로 맞추면서 무엇을 왜 바꿨는지 알려 준다.
 */
export function NumberField({
  label,
  value,
  min,
  max,
  onCommit,
}: {
  label: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}) {
  const [text, setText] = useState(String(value))
  const [shown, setShown] = useState(value)
  // 확정하면서 바꾼 이유. 값이 다시 바뀌면(무작위 수 등) 더는 맞지 않으므로 그 값에 묶어 둔다.
  const [notice, setNotice] = useState<{ value: number; text: string } | null>(null)
  const noticeId = useId()

  // 무작위 수나 다른 탭에서 값이 바뀌면 칸도 따라간다.
  if (shown !== value) {
    setShown(value)
    setText(String(value))
    if (notice && notice.value !== value) setNotice(null)
  }

  const warning = notice?.value === value ? notice.text : ""

  function commit() {
    const next = clampedParam(text, value, parsed => clampInteger(parsed, min, max))
    const reason = adjustment(text, next, min, max)
    setText(String(next))
    setNotice(reason ? { value: next, text: reason } : null)
    onCommit(next)
  }

  return (
    <div className="number-field">
      <label>
        {label}
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={text}
          aria-invalid={Boolean(warning)}
          aria-describedby={warning ? noticeId : undefined}
          onChange={event => {
            // 새로 치기 시작하면 지난 확정의 이유는 더 이상 맞지 않는다.
            setText(event.target.value)
            setNotice(null)
          }}
          onBlur={commit}
          onKeyDown={blurOnEnter}
        />
      </label>
      {warning && (
        <p id={noticeId} className="sim-error number-field__warning" role="alert">
          {warning}
        </p>
      )}
    </div>
  )
}
