import { Link } from "react-router"

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="현재 위치" className="pt-6 text-[0.95rem] text-ink-2">
      <ol className="flex flex-wrap items-center gap-x-2">
        <li>
          <Link to="/" className="hover:text-ink hover:underline">
            홈
          </Link>
        </li>
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.label} className="flex items-center gap-x-2">
              <span aria-hidden="true">›</span>
              {c.to && !last ? (
                <Link to={c.to} className="hover:text-ink hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-ink">
                  {c.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
