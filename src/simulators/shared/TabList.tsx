import type { CSSProperties } from "react"

export interface TabItem<Id extends string> {
  id: Id
  title: string
}

function nextTabIndex(key: string, index: number, count: number) {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % count
    case "ArrowLeft":
      return (index + count - 1) % count
    case "Home":
      return 0
    case "End":
      return count - 1
    default:
      return undefined
  }
}

/**
 * 방향키와 Home/End로 옮겨 다니는 탭 목록. 탭 id는 시뮬레이터마다 다르므로
 * idPrefix로 받고, 열 수는 --tab-count로 넘겨 CSS가 격자를 잡게 한다.
 */
export function TabList<Id extends string>({
  items,
  current,
  idPrefix,
  panelId,
  label,
  change,
}: {
  items: readonly TabItem<Id>[]
  current: Id
  idPrefix: string
  panelId: string
  label: string
  change: (id: Id) => void
}) {
  return (
    <div
      className="sim-tabs"
      role="tablist"
      aria-label={label}
      style={{ "--tab-count": items.length } as CSSProperties}
    >
      {items.map((item, index) => (
        <button
          type="button"
          key={item.id}
          id={`${idPrefix}${item.id}`}
          role="tab"
          aria-selected={current === item.id}
          aria-controls={panelId}
          tabIndex={current === item.id ? 0 : -1}
          onClick={() => change(item.id)}
          onKeyDown={event => {
            const target = nextTabIndex(event.key, index, items.length)
            if (target === undefined) return
            event.preventDefault()
            const next = items[target].id
            change(next)
            document.getElementById(`${idPrefix}${next}`)?.focus()
          }}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}
