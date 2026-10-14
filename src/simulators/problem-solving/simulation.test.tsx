import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { ProblemSolvingPage } from "."
import { readRecords } from "./shared/records"
import { examEngine } from "./sort/exam"

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter initialEntries={[`/units/algorithm/problem-solving${query ? `?${query}` : ""}`]}>
      <ProblemSolvingPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it("전략 탭을 URL과 동기화하고 방향키로 이동한다", () => {
  open("speed=100")
  expect(screen.getByLabelText("진행 속도")).toHaveValue("800:100")
  const lock = screen.getByRole("tab", { name: "시행착오" })
  const change = screen.getByRole("tab", { name: "욕심쟁이" })
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  expect(change).toHaveFocus()
  expect(change).toHaveAttribute("aria-selected", "true")
  expect(screen.getByTestId("location")).toHaveTextContent("strategy=change")
  fireEvent.click(screen.getByRole("tab", { name: "나누어 해결하기" }))
  expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "ps-tab-sort")
})

it("2자리 직접 입력 07을 8회에 찾고 되감기 뒤 중복 저장하지 않는다", () => {
  open("strategy=lock&d=2&pos=manual")
  const input = screen.getByLabelText("직접 입력한 비밀번호")
  fireEvent.change(input, { target: { value: "07" } })
  fireEvent.blur(input)
  for (let index = 0; index < 8; index += 1)
    fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(screen.getByText(/07에서 열렸습니다\. 8회/)).toHaveClass("result")
  expect(readRecords()).toHaveLength(1)
  expect(screen.getByTestId("location").textContent).not.toContain("07")
  fireEvent.click(screen.getByRole("button", { name: "◀ 이전" }))
  fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(readRecords()).toHaveLength(1)
})

it("욕심쟁이 반례와 시험지 묶음 정리 결과를 화면에 보여 준다", () => {
  const view = open("strategy=change&coins=labA&amount=120")
  for (let index = 0; index < 3; index += 1)
    fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(screen.getByText(/모두 3개입니다/)).toHaveClass("result")
  expect(screen.getByText("욕심쟁이 결과와 다릅니다.")).toBeInTheDocument()
  view.unmount()

  open("strategy=sort&n=30&order=reverse")
  const steps = examEngine.init({ n: 30, order: "reverse" }, 0).trace.length
  for (let index = 0; index < steps; index += 1)
    fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(screen.getByText("135회", { selector: "dd" })).toBeInTheDocument()
  expect(readRecords().at(-1)).toMatchObject({ task: "exam", n: 30, comparisons: 135 })
})

it("주소와 입력칸에 같은 값을 넣으면 같은 시험지 수와 금액이 된다", () => {
  const sort = open("strategy=sort&n=0")
  expect(screen.getByLabelText("시험지 수")).toHaveValue(2)
  fireEvent.change(screen.getByLabelText("시험지 수"), { target: { value: "0" } })
  fireEvent.blur(screen.getByLabelText("시험지 수"))
  expect(screen.getByLabelText("시험지 수")).toHaveValue(2)
  sort.unmount()

  open("strategy=change&coins=korea&amount=")
  expect(screen.getByLabelText(/거스름돈 금액/)).toHaveValue(120)
  fireEvent.change(screen.getByLabelText(/거스름돈 금액/), { target: { value: "" } })
  fireEvent.blur(screen.getByLabelText(/거스름돈 금액/))
  expect(screen.getByLabelText(/거스름돈 금액/)).toHaveValue(120)
})

it("단축키는 입력을 방해하지 않고 전략 전환 시 자동 실행 타이머를 정리한다", () => {
  vi.useFakeTimers()
  open("strategy=lock&d=4&pos=worst")
  fireEvent.change(screen.getByLabelText("진행 속도"), { target: { value: "800:1000" } })
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  act(() => vi.advanceTimersByTime(800))
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "1000")
  fireEvent.click(screen.getByRole("tab", { name: "욕심쟁이" }))
  act(() => vi.advanceTimersByTime(8000))
  expect(readRecords()).toHaveLength(0)

  fireEvent.click(screen.getByRole("tab", { name: "시행착오" }))
  fireEvent.change(screen.getByRole("combobox", { name: "비밀번호 위치" }), {
    target: { value: "manual" },
  })
  const input = screen.getByLabelText("직접 입력한 비밀번호")
  fireEvent.keyDown(input, { code: "Space", key: " " })
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0")
})

it("이전 채팅의 기본값과 상단 질문을 세 탭에 반영한다", () => {
  open()
  expect(screen.getByLabelText("진행 속도")).toHaveValue("800:1000")
  expect(
    screen.getByRole("heading", { name: "답을 찾을 수 있지만, 얼마나 많은 시도가 필요할까?" }),
  ).toBeInTheDocument()
  expect(screen.queryByText(/단계 기록/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("tab", { name: "욕심쟁이" }))
  expect(screen.getByLabelText(/거스름돈 금액/)).toHaveValue(120)
  expect(
    screen.getByRole("heading", { name: "지금 가장 좋아 보이는 선택이 최종 결과에서도 좋을까?" }),
  ).toBeInTheDocument()
  fireEvent.click(screen.getByRole("tab", { name: "나누어 해결하기" }))
  expect(screen.getByLabelText("시험지 수")).toHaveValue(30)
  expect(screen.getByLabelText("시험지 순서")).toHaveValue("random")
  expect(screen.queryByText("한 장씩 모두 비교하기")).not.toBeInTheDocument()
})

it("시험지를 한 번에 정리하고 되감기 후 다시 완료해도 기록은 하나만 저장한다", () => {
  open("strategy=sort&n=30")
  fireEvent.change(screen.getByLabelText("진행 속도"), { target: { value: "800:1000" } })
  fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(screen.getByText("합쳐서 완성한 줄 · 1번부터 30번까지")).toBeInTheDocument()
  expect(readRecords()).toHaveLength(1)
  fireEvent.click(screen.getByRole("button", { name: "◀ 이전" }))
  expect(screen.queryByText("합쳐서 완성한 줄 · 1번부터 30번까지")).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(readRecords()).toHaveLength(1)
})
