import type { SimulatorStatus } from "../../content/units"
import { statusLabel } from "../../content/units"

const tone: Record<SimulatorStatus, string> = {
  ready: "bg-ink text-paper",
  "in-progress": "bg-marker text-ink",
  "coming-soon": "border border-line text-ink-2",
}

export function StatusBadge({ status }: { status: SimulatorStatus }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[0.8rem] font-medium ${tone[status]}`}>
      {statusLabel[status]}
    </span>
  )
}
