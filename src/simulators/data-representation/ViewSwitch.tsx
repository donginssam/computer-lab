import type { TabItem } from "../shared/TabList"

/**
 * 문자·그림 탭 안에서 두 가지 보기를 고르는 버튼. 위쪽 탭과 겹쳐 보이지 않도록
 * 탭 목록 대신 눌림 상태 버튼 묶음으로 둔다.
 */
export function ViewSwitch<Id extends string>({
  items,
  current,
  label,
  change,
}: {
  items: readonly TabItem<Id>[]
  current: Id
  label: string
  change: (id: Id) => void
}) {
  return (
    <div className="button-row data-views" role="group" aria-label={label}>
      {items.map(item => (
        <button
          type="button"
          key={item.id}
          aria-pressed={item.id === current}
          onClick={() => change(item.id)}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}
