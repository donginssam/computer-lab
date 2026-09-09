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
  function chooseSet(next: CoinSetId) {
    const preset = coinPresets.find(item => item.id === next)!
    change({ coins: next, amount: String(preset.exampleAmount) })
  }

  return (
    <section className="ps-card ps-settings" aria-label="거스름돈 실험 설정">
      <label>
        거스름돈 금액
        <span className="ps-inline-field">
          <input
            type="number"
            min={10}
            max={9990}
            step={10}
            key={amount}
            defaultValue={amount}
            onBlur={event => {
              const value =
                Math.round(Math.max(10, Math.min(9990, Number(event.target.value) || 10)) / 10) * 10
              event.currentTarget.value = String(value)
              change({ amount: String(value) })
            }}
            onKeyDown={event => {
              if (event.key === "Enter") event.currentTarget.blur()
            }}
          />
          원
        </span>
      </label>
      <button
        type="button"
        onClick={() => change({ amount: String((Math.floor(Math.random() * 999) + 1) * 10) })}
      >
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
      <p className="ps-note">
        매번 남은 금액 이하에서 가장 큰 동전을 하나 고릅니다. 설정을 바꾸면 새 실험이 시작됩니다.
      </p>
    </section>
  )
}
