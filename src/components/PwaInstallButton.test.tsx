import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { PwaInstallButton } from "./PwaInstallButton"

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "")
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open")
  }
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal")
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close")
})

it("설치 이벤트가 없으면 안내를 보여 준다", () => {
  render(<PwaInstallButton />)
  fireEvent.click(screen.getByRole("button", { name: "앱 설치" }))
  expect(screen.getByRole("dialog", { name: "앱으로 설치하기" })).toBeVisible()
})

it("사용자 클릭으로 설치 창을 한 번만 열고 설치 완료 후 숨긴다", async () => {
  render(<PwaInstallButton />)
  const prompt = vi.fn().mockResolvedValue({ outcome: "dismissed" })
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt })
  act(() => window.dispatchEvent(event))
  expect(event.defaultPrevented).toBe(true)
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "앱 설치" })))
  expect(prompt).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole("button", { name: "앱 설치" }))
  expect(prompt).toHaveBeenCalledTimes(1)
  act(() => window.dispatchEvent(new Event("appinstalled")))
  expect(screen.queryByRole("button", { name: "앱 설치" })).not.toBeInTheDocument()
})

it("독립 앱 창에서는 설치 버튼을 표시하지 않는다", () => {
  vi.mocked(window.matchMedia).mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList)
  render(<PwaInstallButton />)
  expect(screen.queryByRole("button", { name: "앱 설치" })).not.toBeInTheDocument()
})
