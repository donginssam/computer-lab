import { useState } from "react"
import { blurOnEnter } from "../../shared/blurOnEnter"
import { CARD_MAX, CARD_MIN, clampCardCount } from "../bounds"
import { parseCardInput, type SortOrder } from "./engine"

const orderNames: Record<SortOrder, string> = {
  random: "무작위",
  worst: "가장 많이 비교하는 순서",
  reverse: "거꾸로",
  manual: "직접 입력",
}

export function SortPanel({
  n,
  order,
  change,
  setManualCards,
}: {
  n: number
  order: SortOrder
  change: (updates: Record<string, string>) => void
  setManualCards: (cards: number[] | undefined) => void
}) {
  const [manualText, setManualText] = useState("35-12-90-7")
  const [error, setError] = useState("")
  return (
    <section className="sim-card ps-settings" aria-label="숫자 카드 실험 설정">
      <label>
        카드 수{" "}
        <input
          type="number"
          min={CARD_MIN}
          max={CARD_MAX}
          key={n}
          defaultValue={n}
          onBlur={event => {
            const value = clampCardCount(Number(event.target.value) || 8)
            event.currentTarget.value = String(value)
            setManualCards(undefined)
            change({ n: String(value) })
          }}
          onKeyDown={blurOnEnter}
        />
      </label>
      <label>
        카드 순서{" "}
        <select
          value={order}
          onChange={event => {
            setError("")
            setManualCards(undefined)
            change({ order: event.target.value })
          }}
        >
          {Object.entries(orderNames).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {order === "manual" && (
        <label className="ps-wide-field">
          숫자 카드 직접 입력{" "}
          <input
            aria-label="숫자 카드 직접 입력"
            value={manualText}
            onChange={event => setManualText(event.target.value)}
            onBlur={() => {
              try {
                const cards = parseCardInput(manualText, n)
                setError("")
                setManualCards(cards)
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "카드 값을 확인해 주세요.")
                setManualCards(undefined)
              }
            }}
            onKeyDown={blurOnEnter}
          />
        </label>
      )}
      {error && (
        <p className="ps-input-error" role="alert">
          {error} 이번 실험은 무작위 카드로 시작합니다.
        </p>
      )}
      <p className="small-note">
        큰 묶음을 반으로 나누고, 작은 묶음을 정리한 뒤 다시 합칩니다. 설정을 바꾸면 새 실험이
        시작됩니다.
      </p>
    </section>
  )
}
