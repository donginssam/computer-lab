import { Outlet } from "react-router"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { useScrollRestoration } from "./useScrollRestoration"

export function AppShell() {
  useScrollRestoration()
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-5 pb-24 sm:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
