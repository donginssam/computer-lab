import { Breadcrumb } from "../../components/layout/Breadcrumb"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { unitById, unitPath } from "../../content/units"

export function BalanceScalePage() {
  const unit = unitById("algorithm")!
  const sim = unit.simulators.find(s => s.slug === "balance-scale")!

  return (
    <div style={{ "--unit": unit.color } as React.CSSProperties}>
      <Breadcrumb items={[{ label: unit.title, to: unitPath(unit) }, { label: sim.title }]} />

      <header className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[clamp(2rem,5vw,3rem)]">{sim.title}</h1>
        <StatusBadge status={sim.status} />
      </header>
      <p className="mt-4 max-w-[60ch] text-[1.05rem] text-ink-2">
        겉모양이 똑같은 상자 가운데 딱 하나만 가볍습니다. 양팔저울은 한 번에 "왼쪽이 가볍다,
        오른쪽이 가볍다, 같다" 셋 중 하나만 알려 줍니다. 저울을 가장 적게 써서 가벼운 상자를 찾아
        보세요.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border-l-8 border-(--unit) bg-white/80 p-5">
          <h2 className="text-[1.3rem]">차례로 비교하기</h2>
          <p className="mt-2 text-ink-2">
            상자를 두 개씩 짝지어 순서대로 저울에 올립니다. 상자가 두 배로 늘면 저울질도 두 배로
            늘어납니다.
          </p>
        </div>
        <div className="rounded-lg border-l-8 border-(--unit) bg-white/80 p-5">
          <h2 className="text-[1.3rem]">절반씩 나누기</h2>
          <p className="mt-2 text-ink-2">
            남은 상자를 반으로 갈라 양쪽에 올리고, 가벼운 쪽만 남깁니다. 상자가 두 배로 늘어도
            저울질은 한 번만 늘어납니다.
          </p>
        </div>
      </section>

      <p className="mt-10 rounded-lg bg-marker/40 p-5 text-ink">
        시뮬레이터는 지금 만드는 중입니다. 완성되면 이 자리에서 단계별 실행, 자동 실행, 두 알고리즘
        나란히 비교, 직접 해보기를 할 수 있습니다.
      </p>
    </div>
  )
}
