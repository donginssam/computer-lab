import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { BinaryNumberPage } from "."

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter initialEntries={[`/units/data/binary-number${query ? `?${query}` : ""}`]}>
      <BinaryNumberPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const card = (value: number) => screen.getByRole("button", { name: new RegExp(`^${value} 카드`) })
const status = () => screen.getAllByRole("status")[0]

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("자릿값 카드를 켜서 만들 수를 완성하고, 넘치면 안내한다", () => {
  open("n=13")
  expect(status()).toHaveTextContent("13만큼 더 필요합니다")
  fireEvent.click(card(8))
  fireEvent.click(card(4))
  fireEvent.click(card(1))
  expect(card(8)).toHaveAttribute("aria-pressed", "true")
  expect(status()).toHaveTextContent("성공! 13을 이진수로 쓰면 0000 1101")
  fireEvent.click(card(16))
  expect(status()).toHaveTextContent("16만큼 넘쳤습니다")
  fireEvent.click(screen.getByRole("button", { name: "모두 끄기" }))
  expect(card(16)).toHaveAttribute("aria-pressed", "false")
})

it("2로 나누기를 끝까지 진행하면 나머지를 거꾸로 읽고 카드 탭으로 넘어간다", () => {
  open("tab=divide&d=13")
  const next = () => screen.getByRole("button", { name: "다음 단계 ▶" })
  for (let i = 0; i < 4; i += 1) fireEvent.click(next())
  expect(status()).toHaveTextContent("몫 0이 되었습니다")
  expect(screen.getByText("4. 1 ÷ 2 = 0 … 나머지 1")).toBeInTheDocument()
  fireEvent.click(next())
  expect(status()).toHaveTextContent("13을 이진수로 쓰면 1101입니다")
  expect(next()).toBeDisabled()

  fireEvent.click(screen.getByRole("button", { name: "◀ 이전" }))
  expect(next()).toBeEnabled()
  fireEvent.click(next())

  fireEvent.click(screen.getByRole("button", { name: "자릿값 카드로 확인하기" }))
  expect(screen.getByRole("tab", { name: "자릿값 카드" })).toHaveAttribute("aria-selected", "true")
  expect(screen.getByTestId("location")).toHaveTextContent("tab=cards")
  expect(screen.getByTestId("location")).toHaveTextContent("n=13")
})

it("자동 실행과 단축키로 2로 나누기를 진행한다", () => {
  vi.useFakeTimers()
  open("tab=divide&d=6")
  fireEvent.keyDown(document.body, { code: "Space", key: " " })
  expect(screen.getByText("1. 6 ÷ 2 = 3 … 나머지 0")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "▶ 자동 실행" }))
  // 한 단계가 끝날 때마다 다음 타이머가 다시 걸리므로 한 틱씩 진행한다.
  for (let i = 0; i < 3; i += 1) act(() => vi.advanceTimersByTime(800))
  expect(status()).toHaveTextContent("6을 이진수로 쓰면 110입니다")
  fireEvent.keyDown(document.body, { key: "r" })
  expect(screen.getByText("단계 기록 (0)")).toBeInTheDocument()
})

it("잘못된 주소 값은 기본값으로, 범위 밖 입력은 경계로 맞춘다", () => {
  open("tab=unknown&n=abc")
  expect(screen.getByRole("tab", { name: "자릿값 카드" })).toHaveAttribute("aria-selected", "true")
  expect(screen.getByLabelText("만들 수")).toHaveValue(13)
})

it("입력은 막지 않고, 확정할 때 범위 안으로 바꾸며 이유를 알려 준다", () => {
  open("n=13")
  const target = () => screen.getByLabelText("만들 수")
  const commit = (value: string) => {
    fireEvent.change(target(), { target: { value } })
    expect(target()).toHaveValue(Number(value))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.blur(target())
  }

  commit("999")
  expect(target()).toHaveValue(255)
  expect(screen.getByRole("alert")).toHaveTextContent("입력한 수(999)가 너무 커서 255로 바꿨습니다")
  expect(target()).toHaveAttribute("aria-invalid", "true")
  expect(screen.getByTestId("location")).toHaveTextContent("n=255")

  commit("-5")
  expect(target()).toHaveValue(0)
  expect(screen.getByRole("alert")).toHaveTextContent("음수는 쓸 수 없어서 0으로 바꿨습니다")
  expect(screen.getByTestId("location")).toHaveTextContent("n=0")

  commit("12.7")
  expect(target()).toHaveValue(12)
  expect(screen.getByRole("alert")).toHaveTextContent("소수점 아래를 버렸습니다")

  commit("100")
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  expect(target()).toHaveAttribute("aria-invalid", "false")
})

it("같은 값으로 바뀌어도 경고가 남고, 다른 값으로 바뀌면 사라진다", () => {
  open("n=255")
  const target = () => screen.getByLabelText("만들 수")
  fireEvent.change(target(), { target: { value: "300" } })
  fireEvent.blur(target())
  expect(screen.getByRole("alert")).toHaveTextContent("255로 바꿨습니다")
  fireEvent.click(card(128))
  expect(screen.getByRole("alert")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "무작위 수" }))
  // 무작위로 다시 255가 나올 수 있으므로 값이 바뀐 경우에만 확인한다.
  if ((target() as HTMLInputElement).value !== "255")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
})

it("만들 수가 바뀌면 켜 둔 카드를 모두 끈다", () => {
  open("n=13")
  fireEvent.click(card(8))
  fireEvent.change(screen.getByLabelText("만들 수"), { target: { value: "20" } })
  fireEvent.blur(screen.getByLabelText("만들 수"))
  expect(card(8)).toHaveAttribute("aria-pressed", "false")
})

it("2로 나누기는 0과 음수를 1로, 큰 수를 255로 바꾸고 처음부터 다시 나눈다", () => {
  open("tab=divide&d=13")
  const field = () => screen.getByLabelText("바꿀 수")
  fireEvent.click(screen.getByRole("button", { name: "다음 단계 ▶" }))
  expect(screen.getByText("단계 기록 (1)")).toBeInTheDocument()

  fireEvent.change(field(), { target: { value: "0" } })
  fireEvent.blur(field())
  expect(field()).toHaveValue(1)
  expect(screen.getByRole("alert")).toHaveTextContent("1보다 작은 수는 쓸 수 없어서 1로 바꿨습니다")
  expect(screen.getByText("단계 기록 (0)")).toBeInTheDocument()

  fireEvent.change(field(), { target: { value: "-3" } })
  fireEvent.blur(field())
  expect(screen.getByRole("alert")).toHaveTextContent("음수는 쓸 수 없어서 1로 바꿨습니다")

  fireEvent.change(field(), { target: { value: "1000" } })
  fireEvent.blur(field())
  expect(field()).toHaveValue(255)
  expect(screen.getByRole("alert")).toHaveTextContent("255로 바꿨습니다")
})
