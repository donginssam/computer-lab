import { Link, NavLink } from "react-router"
import { units, unitPath, unitStyle } from "../../content/units"
import { PwaInstallButton } from "../PwaInstallButton"

function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
      <rect width="32" height="32" rx="6" fill="var(--color-ink)" />
      <rect x="6" y="7" width="20" height="14" rx="2" fill="var(--color-paper)" />
      <rect x="9" y="10" width="4" height="4" fill="var(--color-unit-algo)" />
      <rect x="14" y="10" width="4" height="4" fill="var(--color-unit-data)" />
      <rect x="19" y="10" width="4" height="4" fill="var(--color-unit-system)" />
      <rect x="9" y="15" width="9" height="3" fill="var(--color-ink)" opacity=".55" />
      <rect x="12" y="23" width="8" height="2" fill="var(--color-paper)" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:bg-marker focus:px-3 focus:py-1"
      >
        본문으로 건너가기
      </a>
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-[1.05rem] leading-none sm:text-[1.45rem]">
            동인쌤의 컴퓨터실
          </span>
        </Link>

        <nav
          aria-label="단원"
          className="order-3 -mx-5 w-[calc(100%+2.5rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:w-full min-[1100px]:order-none min-[1100px]:w-auto min-[1100px]:min-w-0 min-[1100px]:flex-1"
        >
          <ul className="flex min-w-max gap-1 px-5 sm:justify-end sm:px-0">
            {units.map(u => (
              <li key={u.id} style={unitStyle(u)}>
                <NavLink
                  to={unitPath(u)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-[0.95rem] font-medium whitespace-nowrap",
                      isActive ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink",
                    ].join(" ")
                  }
                >
                  <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-(--unit)" />
                  {u.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto shrink-0">
          <PwaInstallButton />
        </div>
      </div>
    </header>
  )
}
