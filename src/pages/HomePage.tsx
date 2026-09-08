import { Link } from "react-router"
import { UnitTile } from "../components/ui/UnitTile"
import { simulatorPath, units, unitStyle } from "../content/units"

export function HomePage() {
  const availableExperiments = units.flatMap(u =>
    u.simulators.filter(s => s.status !== "coming-soon").map(s => ({ unit: u, sim: s })),
  )

  return (
    <>
      <section className="pt-14 pb-12 sm:pt-20">
        <h1 className="text-[clamp(2.3rem,7vw,4.5rem)]">
          눌러 보고, 돌려 보고,
          <br className="hidden sm:block" /> 비교해 보는 정보 수업
        </h1>
        <p className="mt-5 max-w-[52ch] text-[1.1rem] text-ink-2">
          교과서에 글로만 있던 개념을 직접 움직여 보는 시뮬레이터 모음입니다.
          <br />
          단원을 골라 들어가면 수업에서 바로 쓸 수 있는 실험이 기다리고 있어요.
        </p>
      </section>

      <section aria-labelledby="units-heading">
        <h2 id="units-heading" className="sr-only">
          단원
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {units.map(u => (
            <li key={u.id} className="last:col-span-2 sm:last:col-span-1">
              <UnitTile unit={u} />
            </li>
          ))}
        </ul>
      </section>

      {availableExperiments.length > 0 && (
        <section className="mt-20 max-w-[70ch]" aria-labelledby="now-heading">
          <h2 id="now-heading" className="text-[1.6rem]">
            지금 해 볼 수 있는 실험
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {availableExperiments.map(({ unit, sim }) => (
              <li key={sim.slug}>
                <Link
                  to={simulatorPath(unit, sim)}
                  style={unitStyle(unit)}
                  className="flex items-baseline gap-4 py-4 hover:bg-white/60"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-3 shrink-0 self-start rounded-[3px] bg-(--unit)"
                  />
                  <span>
                    <span className="block text-[1.1rem] font-medium">{sim.title}</span>
                    <span className="block text-ink-2">{sim.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
