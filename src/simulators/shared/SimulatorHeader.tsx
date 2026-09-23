import type { ReactNode } from "react"
import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { unitPath, type Unit } from "../../content/units"

/**
 * 시뮬레이터 페이지 머리. 제목과 번호를 units.ts에서 가져와서, 단원 페이지의 카드와
 * 페이지 제목이 같은 말을 쓰고 목록 순서를 바꾸면 번호도 함께 바뀐다.
 */
export function SimulatorHeader({
  unit,
  slug,
  children,
}: {
  unit: Unit
  slug: string
  children: ReactNode
}) {
  const index = unit.simulators.findIndex(simulator => simulator.slug === slug)
  const { title } = unit.simulators[index]
  return (
    <>
      <Breadcrumb items={[{ label: unit.title, to: unitPath(unit) }, { label: title }]} />
      <header className="mt-6">
        <p className="small-note">
          {unit.lab ?? unit.title} · {String(index + 1).padStart(2, "0")}
        </p>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">{title}</h1>
        <p className="mt-4">{children}</p>
      </header>
    </>
  )
}
