import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { DataRepresentationPage } from ".."

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter
      initialEntries={[`/units/data/data-representation?kind=text${query ? `&${query}` : ""}`]}
    >
      <DataRepresentationPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const status = () => screen.getAllByRole("status")[0]
const bit = (place: number) =>
  screen.getByRole("button", { name: new RegExp(`^${place}의 자리 비트`) })

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it("입력한 글자를 코드·16진수·이진수로 바꾸고 전체 비트를 센다", () => {
  open("t=Hi!")
  const table = screen.getByRole("table")
  expect(within(table).getByText("72")).toBeInTheDocument()
  expect(within(table).getByText("0100 1000")).toBeInTheDocument()
  expect(within(table).getByText("21")).toBeInTheDocument()
  expect(status()).toHaveTextContent("ASCII 문자 3개는 한 글자에 1바이트씩, 모두 24비트입니다")
  expect(screen.getByLabelText("저장되는 비트")).toHaveTextContent("01001000 01101001 00100001")
})

it("한글은 유니코드로 표시하고 3바이트로 센다", () => {
  open()
  fireEvent.change(screen.getByLabelText("바꿀 글자"), { target: { value: "A안" } })
  expect(screen.getByText("유니코드")).toBeInTheDocument()
  expect(screen.getByText("EC 95 88")).toBeInTheDocument()
  expect(status()).toHaveTextContent("모두 4바이트 = 32비트")
  expect(screen.getByTestId("location")).toHaveTextContent("t=A%EC%95%88")
})

it("예시 버튼과 글자 수 제한", () => {
  open()
  fireEvent.click(screen.getByRole("button", { name: "CAT" }))
  expect(screen.getByLabelText("바꿀 글자")).toHaveValue("CAT")
  fireEvent.change(screen.getByLabelText("바꿀 글자"), { target: { value: "ABCDEFGHIJKLMNO" } })
  expect(screen.getByRole("alert")).toHaveTextContent("뒤의 3글자는 표에 넣지 않았습니다")
  fireEvent.change(screen.getByLabelText("바꿀 글자"), { target: { value: "" } })
  expect(screen.getByText("위 칸에 글자를 입력해 보세요.")).toBeInTheDocument()
})

it("비트를 켜고 끄면 코드와 글자가 바뀌고 코드표와 같은 칸을 가리킨다", () => {
  open("view=decode&code=65")
  expect(status()).toHaveTextContent("0100 0001 = 65 → ASCII 코드표에서 ‘A’입니다")
  expect(screen.getByRole("button", { name: "A, 코드 65" })).toHaveAttribute("aria-pressed", "true")
  fireEvent.click(bit(2))
  expect(status()).toHaveTextContent("67")
  expect(status()).toHaveTextContent("‘C’")
  fireEvent.click(screen.getByRole("button", { name: "32의 자리 바꾸기 (대↔소문자)" }))
  expect(status()).toHaveTextContent("‘c’")
  fireEvent.click(screen.getByRole("button", { name: "z, 코드 122" }))
  expect(bit(64)).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByTestId("location")).toHaveTextContent("code=122")
})

it("128 이상은 ASCII 밖, 31 이하는 제어 문자라고 알려 준다", () => {
  open("view=decode&code=200")
  expect(status()).toHaveTextContent("200은 ASCII에 없습니다")
  fireEvent.click(screen.getByRole("button", { name: "모두 0으로" }))
  expect(status()).toHaveTextContent("NUL")
})

it("숨은 낱말을 읽어 확인한다", () => {
  vi.spyOn(Math, "random").mockReturnValue(0)
  open("view=decode")
  const bytes = screen.getByRole("list", { name: "숨은 낱말의 바이트" })
  expect(
    within(bytes)
      .getAllByRole("listitem")
      .map(item => item.textContent),
  ).toEqual(["0100 0011", "0100 0001", "0101 0100"])
  const field = screen.getByLabelText("내가 읽은 낱말")
  fireEvent.change(field, { target: { value: "cab" } })
  fireEvent.click(screen.getByRole("button", { name: "확인" }))
  expect(screen.getByText(/아직 아닙니다/)).toBeInTheDocument()
  fireEvent.change(field, { target: { value: "cat" } })
  fireEvent.keyDown(field, { key: "Enter" })
  expect(screen.getByText(/정답! C=67, A=65, T=84/)).toBeInTheDocument()
})

it("잘못된 주소 값은 기본값과 범위로 맞춘다", () => {
  open("view=zzz&code=999")
  expect(screen.getByRole("button", { name: "문자 → 이진수" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  fireEvent.click(screen.getByRole("button", { name: "이진수 → 문자" }))
  expect(status()).toHaveTextContent("255은 ASCII에 없습니다")
})
