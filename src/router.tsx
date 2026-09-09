import { createBrowserRouter } from "react-router"
import { AppShell } from "./components/layout/AppShell"
import { HomePage } from "./pages/HomePage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { UnitPage } from "./pages/UnitPage"
import { BalanceScalePage } from "./simulators/balance-scale"
import { ProblemSolvingPage } from "./simulators/problem-solving"

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
        { path: "units/algorithm/balance-scale", Component: BalanceScalePage },
        { path: "units/algorithm/problem-solving", Component: ProblemSolvingPage },
        { path: "*", Component: NotFoundPage },
      ],
    },
  ],
  { basename },
)
