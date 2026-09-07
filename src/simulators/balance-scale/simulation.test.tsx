import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router"
import { BalanceScalePage } from "./index"
import { STORAGE_KEY, readRecords } from "./state/records"
function open(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/units/algorithm/balance-scale?${query}`]}>
      <BalanceScalePage />
    </MemoryRouter>,
  )
}
beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
it("같은 조건의 나란히 비교를 저장하고 되감기로 중복 저장하지 않는다", () => {
  open("mode=compare&n=8&algorithm=sequential-pair")
  for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(
    readRecords()
      .map(r => r.comparisons)
      .sort(),
  ).toEqual([3, 4])
  expect(new Set(readRecords().map(r => r.fakeIndex)).size).toBe(1)
  fireEvent.click(screen.getByRole("button", { name: "◀ 이전" }))
  fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(readRecords()).toHaveLength(2)
})
it("자동 실행은 속도 변경, 일시 정지, 탭 전환 시 타이머를 정리한다", () => {
  vi.useFakeTimers()
  open("n=100&algorithm=sequential-pair")
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  act(() => vi.advanceTimersByTime(800))
  expect(screen.getByText("단계 기록 (1)")).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText("속도"), { target: { value: "400" } })
  act(() => vi.advanceTimersByTime(400))
  expect(screen.getByText("단계 기록 (2)")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Ⅱ 일시 정지" }))
  act(() => vi.advanceTimersByTime(1600))
  expect(screen.getByText("단계 기록 (2)")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  fireEvent.click(screen.getByRole("tab", { name: "직접 해보기" }))
  act(() => vi.advanceTimersByTime(30000))
  expect(readRecords()).toHaveLength(0)
  fireEvent.click(screen.getByRole("tab", { name: "시뮬레이션" }))
  expect(screen.getByText("단계 기록 (0)")).toBeInTheDocument()
})
it("직접 해보기에서 같은 개수만 비교하고 밖의 정답을 판정한다", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.99)
  open("mode=try&n=3")
  const weigh = screen.getByRole("button", { name: "저울질 (0회 사용)" })
  expect(weigh).toBeDisabled()
  fireEvent.click(screen.getByRole("button", { name: "1번, 저울 밖" }))
  expect(weigh).toBeDisabled()
  fireEvent.click(screen.getByRole("button", { name: "오른쪽 접시" }))
  fireEvent.click(screen.getByRole("button", { name: "2번, 저울 밖" }))
  fireEvent.click(weigh)
  expect(screen.getByRole("status")).toHaveTextContent("양쪽 무게가 같습니다")
  fireEvent.change(screen.getByLabelText("정답 예상"), { target: { value: "2" } })
  fireEvent.click(screen.getByRole("button", { name: "이 상자가 정답!" }))
  expect(screen.getByRole("status")).toHaveTextContent("★ 정답! 3번")
  expect(screen.getByRole("button", { name: "저울질 (1회 사용)" })).toBeDisabled()
})
it("손상된 저장값과 잘못된 URL을 안전하게 처리한다", () => {
  localStorage.setItem(STORAGE_KEY, "not json")
  expect(readRecords()).toEqual([])
  open("n=nope&mode=unknown")
  expect(screen.getByLabelText("상자 개수")).toHaveValue(7)
  expect(screen.getByRole("tab", { name: "시뮬레이션" })).toHaveAttribute("aria-selected", "true")
})
it("단축키는 입력 중 방해하지 않고 본문에서 실행된다", () => {
  open("n=3")
  fireEvent.keyDown(screen.getByLabelText("상자 개수"), { code: "Space", key: " " })
  expect(screen.getByText("단계 기록 (0)")).toBeInTheDocument()
  fireEvent.keyDown(document.body, { code: "Space", key: " " })
  expect(within(screen.getByRole("tabpanel")).getByRole("status")).toHaveTextContent("완료")
  fireEvent.keyDown(document.body, { key: "r" })
  expect(screen.getByText("단계 기록 (0)")).toBeInTheDocument()
})

it("N=100 빠른 자동 실행이 50회에서 종료하고 기록을 저장한다", () => {
  vi.useFakeTimers()
  open("n=100&algorithm=sequential-pair")
  fireEvent.change(screen.getByLabelText("속도"), { target: { value: "400" } })
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  for (let i = 0; i < 50; i++) act(() => vi.advanceTimersByTime(400))
  expect(screen.getByRole("status")).toHaveTextContent("50회 비교")
  expect(screen.getByRole("button", { name: "▶ 자동 실행" })).toBeDisabled()
  expect(readRecords()).toHaveLength(1)
  act(() => vi.advanceTimersByTime(4000))
  expect(readRecords()[0]?.comparisons).toBe(50)
})
it("숫자 입력을 확정할 때 범위를 보정하고 여러 자리를 입력할 수 있다", () => {
  open("n=100")
  const field = screen.getByLabelText("상자 개수")
  fireEvent.change(field, { target: { value: "999" } })
  fireEvent.blur(field)
  expect(field).toHaveValue(100)
  fireEvent.change(field, { target: { value: "16" } })
  fireEvent.blur(field)
  expect(screen.getByLabelText("상자 개수")).toHaveValue(16)
})
