import { strategies, type StrategyId } from "./strategies"

function nextTabIndex(key: string, index: number) {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % strategies.length
    case "ArrowLeft":
      return (index + strategies.length - 1) % strategies.length
    case "Home":
      return 0
    case "End":
      return strategies.length - 1
    default:
      return undefined
  }
}

export function StrategyTabs({
  strategy,
  change,
}: {
  strategy: StrategyId
  change: (strategy: StrategyId) => void
}) {
  return (
    <div className="ps-tabs" role="tablist" aria-label="문제 해결 전략">
      {strategies.map((item, index) => (
        <button
          type="button"
          key={item.id}
          id={`ps-tab-${item.id}`}
          role="tab"
          aria-selected={strategy === item.id}
          aria-controls="strategy-panel"
          tabIndex={strategy === item.id ? 0 : -1}
          onClick={() => change(item.id)}
          onKeyDown={event => {
            const nextIndex = nextTabIndex(event.key, index)
            if (nextIndex === undefined) return
            event.preventDefault()
            const next = strategies[nextIndex].id
            change(next)
            document.getElementById(`ps-tab-${next}`)?.focus()
          }}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}
