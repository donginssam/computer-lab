import { modes, type Mode } from "../modes"

function nextTabIndex(key: string, index: number) {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % modes.length
    case "ArrowLeft":
      return (index + modes.length - 1) % modes.length
    case "Home":
      return 0
    case "End":
      return modes.length - 1
    default:
      return undefined
  }
}

export function ModeTabs({ mode, change }: { mode: Mode; change: (mode: Mode) => void }) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="실험 모드">
      {modes.map((item, index) => (
        <button
          key={item.id}
          id={`tab-${item.id}`}
          role="tab"
          aria-selected={mode === item.id}
          aria-controls="experiment-panel"
          tabIndex={mode === item.id ? 0 : -1}
          onClick={() => change(item.id)}
          onKeyDown={event => {
            const nextIndex = nextTabIndex(event.key, index)
            if (nextIndex === undefined) return
            event.preventDefault()
            const nextMode = modes[nextIndex].id
            change(nextMode)
            document.getElementById(`tab-${nextMode}`)?.focus()
          }}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}
