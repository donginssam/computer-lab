import { createBrowserRouter } from "react-router"
import { AppShell } from "./components/layout/AppShell"
import { HomePage } from "./pages/HomePage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { UnitPage } from "./pages/UnitPage"

// Vite의 BASE_URL은 끝에 슬래시가 붙어 오므로 basename에서는 떼어 낸다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "")

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: AppShell,
      children: [
        { index: true, Component: HomePage },
        { path: "units/:unitId", Component: UnitPage },
        // 라우트 lazy는 내비게이션 중에 모듈을 기다리므로 Suspense 경계가 필요 없다.
        // 청크는 서비스 워커가 모두 precache하므로 오프라인에서도 그대로 열린다.
        {
          path: "units/algorithm/balance-scale",
          lazy: async () => ({
            Component: (await import("./simulators/balance-scale")).BalanceScalePage,
          }),
        },
        {
          path: "units/algorithm/problem-solving",
          lazy: async () => ({
            Component: (await import("./simulators/problem-solving")).ProblemSolvingPage,
          }),
        },
        { path: "*", Component: NotFoundPage },
      ],
    },
  ],
  { basename },
)
