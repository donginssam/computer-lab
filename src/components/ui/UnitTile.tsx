import { Link } from "react-router"
import type { Unit } from "../../content/units"
import { unitPath, unitStyle } from "../../content/units"

/** 홈의 단원 폴더 타일. 단색 면 + 위쪽 탭으로 폴더를 표현한다. */
export function UnitTile({ unit }: { unit: Unit }) {
  const count = unit.simulators.filter(s => s.status !== "coming-soon").length
  return (
    <Link
      to={unitPath(unit)}
      style={unitStyle(unit)}
      className="folder-tab group relative mt-3 flex min-h-44 flex-col justify-between rounded-lg rounded-tl-none bg-(--unit) p-5 text-paper transition-transform duration-200 ease-out-soft hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-52"
    >
      <span className="font-display text-[3.5rem] leading-none opacity-90">{unit.order}</span>
      <span>
        <span className="block font-display text-[1.55rem] leading-tight">{unit.title}</span>
        {count > 0 && (
          <span className="mt-1 block text-[0.95rem] opacity-90">시뮬레이터 {count}개</span>
        )}
      </span>
    </Link>
  )
}
