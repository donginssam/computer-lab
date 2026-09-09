import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { AppRoutes } from "./router"
import { PwaUpdatePrompt } from "./components/PwaUpdatePrompt"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoutes />
    <PwaUpdatePrompt />
  </StrictMode>,
)
