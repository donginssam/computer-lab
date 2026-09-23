import { blurOnEnter } from "../../shared/blurOnEnter"
import { clampedParam } from "../../shared/params"
import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP, clampAmount, randomAmount } from "../bounds"
import { coinPresets, type CoinSetId } from "./engine"

export function ChangePanel({
  amount,
  coinSet,
  change,
}: {
  amount: number
  coinSet: CoinSetId
  change: (updates: Record<string, string>) => void
}) {
  const exampleAmount = (id: CoinSetId) => coinPresets.find(item => item.id === id)!.exampleAmount

  function chooseSet(next: CoinSetId) {
    change({ coins: next, amount: String(exampleAmount(next)) })
  }

  return (
    <section className="sim-card ps-settings" aria-label="거스름돈 실험 설정">
      <label>
        거스름돈 금액
        <span className="ps-inline-field">
          <input
            type="number"
            min={AMOUNT_MIN}
            max={AMOUNT_MAX}
            step={AMOUNT_STEP}
            key={amount}
            defaultValue={amount}
            onBlur={event => {
              // 주소와 같은 함수로 읽는다. 빈칸은 주소에 금액이 없을 때처럼 예시 금액이 된다.
              const value = clampedParam(event.target.value, exampleAmount(coinSet), clampAmount)
              event.currentTarget.value = String(value)
              change({ amount: String(value) })
            }}
            onKeyDown={blurOnEnter}
          />
          원
        </span>
      </label>
      <button type="button" onClick={() => change({ amount: String(randomAmount()) })}>
        금액 무작위
      </button>
      <label>
        동전 종류{" "}
        <select value={coinSet} onChange={event => chooseSet(event.target.value as CoinSetId)}>
          {coinPresets.map(preset => (
            <option value={preset.id} key={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </label>
      <p className="small-note">
        매번 남은 금액 이하에서 가장 큰 동전을 하나 고릅니다. 설정을 바꾸면 새 실험이 시작됩니다.
      </p>
    </section>
  )
}
