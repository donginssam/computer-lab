import { useParams } from "react-router"
import { Breadcrumb } from "../components/layout/Breadcrumb"
import { SimulatorCard } from "../components/ui/SimulatorCard"
import { unitById } from "../content/units"
import { NotFoundPage } from "./NotFoundPage"

export function UnitPage() {
  const { unitId } = useParams()
  const unit = unitById(unitId)
  if (!unit) return <NotFoundPage />

  return (
    <div style={{ "--unit": unit.color } as React.CSSProperties}>
      <Breadcrumb items={[{ label: unit.title }]} />

      <header className="mt-6 rounded-lg bg-(--unit) px-6 py-8 text-paper sm:px-8 sm:py-10">
        <p className="font-display text-[1.2rem] opacity-90">{unit.order}단원</p>
        <h1 className="mt-1 text-[clamp(2.2rem,5vw,3.2rem)]">{unit.title}</h1>
        <p className="mt-4 max-w-[48ch] text-[1.05rem]">{unit.lead}</p>
      </header>

      <section className="mt-10" aria-labelledby="sims-heading">
        <h2 id="sims-heading" className="text-[1.6rem]">
          시뮬레이터
        </h2>
        {unit.simulators.length === 0 ? (
          <div className="mt-4 rounded-lg border-2 border-dashed border-line p-8 text-ink-2">
            <p className="text-[1.05rem]">아직 이 단원에는 시뮬레이터가 없습니다.</p>
            <p className="mt-1">
              {unit.blurb} 주제로 만들 예정입니다. 알고리즘과 프로그래밍 단원부터 채워 갑니다.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4">
            {unit.simulators.map(sim => (
              <li key={sim.slug}>
                <SimulatorCard unit={unit} sim={sim} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
