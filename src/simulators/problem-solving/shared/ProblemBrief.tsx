import type { ReactNode } from "react"

export function ProblemBrief({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sim-card problem-brief" aria-label="문제 상황">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  )
}
