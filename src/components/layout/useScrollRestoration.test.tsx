import { act, cleanup, render } from "@testing-library/react"
import { useEffect } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import {
  MemoryRouter,
  useNavigate,
  useSearchParams,
  type NavigateFunction,
  type SetURLSearchParams,
} from "react-router"
import { useScrollRestoration } from "./useScrollRestoration"

let navigate: NavigateFunction
let setParams: SetURLSearchParams

function Probe() {
  useScrollRestoration()
  const currentNavigate = useNavigate()
  const [, currentSetParams] = useSearchParams()
  useEffect(() => {
    navigate = currentNavigate
    setParams = currentSetParams
  })
  return null
}

function scrollAt(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true })
}

beforeEach(() => sessionStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  scrollAt(0)
})

it("같은 페이지에서 설정과 모드 탭만 바뀌면 스크롤과 저장소를 건드리지 않는다", () => {
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={["/units/algorithm/balance-scale?n=8"]}>
      <Probe />
    </MemoryRouter>,
  )
  scrollTo.mockClear()
  sessionStorage.clear()
  act(() => {
    setParams({ n: "9" }, { replace: true })
  })
  act(() => {
    setParams({ n: "9", mode: "compare" })
  })
  act(() => {
    navigate(-1)
  })
  expect(scrollTo).not.toHaveBeenCalled()
  expect(sessionStorage.length).toBe(0)
})

it("다른 페이지로 가면 맨 위로 올리고, 뒤로 가면 떠날 때 위치로 돌린다", () => {
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Probe />
    </MemoryRouter>,
  )
  scrollAt(640)
  act(() => {
    navigate("/units/algorithm")
  })
  expect(scrollTo).toHaveBeenLastCalledWith(0, 0)
  scrollAt(120)
  act(() => {
    navigate(-1)
  })
  expect(scrollTo).toHaveBeenLastCalledWith(0, 640)
})
