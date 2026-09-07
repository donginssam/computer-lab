import { Link } from "react-router"
import type { SimulatorMeta, Unit } from "../../content/units"
import { simulatorPath } from "../../content/units"
import { StatusBadge } from "./StatusBadge"

export function SimulatorCard({ unit, sim }: { unit: Unit; sim: SimulatorMeta }) {
  const clickable = sim.status !== "coming-soon"
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.35rem]">{sim.title}</h3>
        <StatusBadge status={sim.status} />
      </div>
      <p className="mt-2 max-w-[60ch] text-ink-2">{sim.summary}</p>
    </>
  )
  const base = "block rounded-lg border-l-8 bg-white/80 p-5 border-(--unit)"
  return clickable ? (
    <Link
      to={simulatorPath(unit, sim)}
      style={{ "--unit": unit.color } as React.CSSProperties}
      className={`${base} hover:bg-white`}
    >
      {body}
    </Link>
  ) : (
    <div style={{ "--unit": unit.color } as React.CSSProperties} className={base}>
      {body}
    </div>
  )
}
