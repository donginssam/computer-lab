import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { AppShell } from "./components/layout/AppShell"
import { HomePage } from "./pages/HomePage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { UnitPage } from "./pages/UnitPage"

// Vite의 BASE_URL은 끝에 슬래시가 붙어 오므로 basename에서는 떼어 낸다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "")

// 시뮬레이터 청크는 서비스 워커가 모두 precache하므로 오프라인에서도 열린다.
const BalanceScalePage = lazy(() =>
  import("./simulators/balance-scale").then(m => ({ default: m.BalanceScalePage })),
)
const ProblemSolvingPage = lazy(() =>
  import("./simulators/problem-solving").then(m => ({ default: m.ProblemSolvingPage })),
)

/**
 * loader도 action도 쓰지 않으므로 선언형 라우터로 충분하다. createBrowserRouter의
 * 데이터 라우터 런타임은 최초 로드 JS의 4분의 1을 차지한다.
 */
export function AppRoutes() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="units/:unitId" element={<UnitPage />} />
          <Route
            path="units/algorithm/balance-scale"
            element={
              <Suspense fallback={null}>
                <BalanceScalePage />
              </Suspense>
            }
          />
          <Route
            path="units/algorithm/problem-solving"
            element={
              <Suspense fallback={null}>
                <ProblemSolvingPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
