import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { SoundDigitizePage } from "."

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter initialEntries={[`/units/data/sound-digitize${query ? `?${query}` : ""}`]}>
      <SoundDigitizePage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const status = () => screen.getAllByRole("status")[0]
const next = () => screen.getByRole("button", { name: "다음 단계 ▶" })
const current = () =>
  screen.getByRole("list", { name: "변환 단계" }).querySelector("[aria-current]")

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("표본화 → 양자화 → 부호화 → 다시 소리로 차례로 진행한다", () => {
  open("n=8&bits=3")
  expect(current()).toHaveTextContent("원래 소리")
  expect(screen.queryByRole("list", { name: "표본 값" })).not.toBeInTheDocument()

  fireEvent.click(next())
  expect(current()).toHaveTextContent("① 표본화")
  expect(status()).toHaveTextContent("8번 쟀습니다")
  expect(screen.getByRole("list", { name: "표본 값" }).children).toHaveLength(8)

  fireEvent.click(next())
  expect(status()).toHaveTextContent("8개 단계 중 가장 가까운 단계")
  expect(screen.getByRole("img")).toHaveAccessibleName(/8단계/)

  fireEvent.click(next())
  expect(status()).toHaveTextContent("표본 8개 × 3비트 = 24비트")
  expect(screen.getByLabelText("저장되는 비트").textContent!.replace(/ /g, "")).toHaveLength(24)

  fireEvent.click(next())
  expect(status()).toHaveTextContent(/원래 소리와 평균 \d+\.\d% 차이/)
  expect(next()).toBeDisabled()
})

it("설정을 바꿔도 단계는 그대로이고 주소에 남는다", () => {
  open("n=8&bits=3")
  for (let i = 0; i < 3; i += 1) fireEvent.click(next())
  fireEvent.click(screen.getByRole("button", { name: "4비트 (16단계)" }))
  expect(status()).toHaveTextContent("표본 8개 × 4비트 = 32비트")
  fireEvent.change(screen.getByLabelText(/표본 수 슬라이더/), { target: { value: "16" } })
  expect(status()).toHaveTextContent("표본 16개 × 4비트 = 64비트")
  fireEvent.click(screen.getByRole("button", { name: "복잡한 소리" }))
  expect(screen.getByTestId("location")).toHaveTextContent("n=16&bits=4&wave=complex")
})

it("표본 수 입력은 범위 안으로 맞추고 이유를 알려 준다", () => {
  open()
  const field = screen.getByLabelText("표본 수")
  fireEvent.change(field, { target: { value: "100" } })
  fireEvent.blur(field)
  expect(field).toHaveValue(32)
  expect(screen.getByRole("alert")).toHaveTextContent(
    "입력한 수(100)가 너무 커서 32로 바꿨습니다. 이 그래프에서는 32번까지 잴 수 있습니다.",
  )
  fireEvent.change(field, { target: { value: "1" } })
  fireEvent.blur(field)
  expect(field).toHaveValue(4)
})

it("자동 실행과 단축키", () => {
  vi.useFakeTimers()
  open()
  fireEvent.keyDown(document.body, { code: "Space", key: " " })
  expect(current()).toHaveTextContent("① 표본화")
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  for (let i = 0; i < 3; i += 1) act(() => vi.advanceTimersByTime(800))
  expect(current()).toHaveTextContent("다시 소리로")
  fireEvent.keyDown(document.body, { key: "r" })
  expect(current()).toHaveTextContent("원래 소리")
})

it("잘못된 주소 값은 기본값과 범위로 맞춘다", () => {
  open("n=abc&bits=9&wave=noise")
  expect(screen.getByLabelText("표본 수")).toHaveValue(12)
  expect(screen.getByRole("button", { name: "4비트 (16단계)" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  expect(screen.getByRole("button", { name: "부드러운 소리" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
})
