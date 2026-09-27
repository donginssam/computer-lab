import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { DataRepresentationPage } from ".."

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter
      initialEntries={[`/units/data/data-representation?kind=image${query ? `&${query}` : ""}`]}
    >
      <DataRepresentationPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const status = () => screen.getAllByRole("status")[0]
const pixel = (row: number, column: number) =>
  screen.getByRole("button", { name: new RegExp(`^${row}행 ${column}열,`) })

afterEach(cleanup)

it("R·G·B 세기를 바꾸면 16진수와 이진수가 따라 바뀐다", () => {
  open("color=000000")
  expect(status()).toHaveTextContent("검정: R 0 · G 0 · B 0 → #000000")
  fireEvent.change(screen.getByLabelText("빨강 세기 슬라이더"), { target: { value: "255" } })
  fireEvent.change(screen.getByLabelText("초록 세기 슬라이더"), { target: { value: "255" } })
  expect(status()).toHaveTextContent("노랑: R 255 · G 255 · B 0 → #FFFF00")
  expect(screen.getByTestId("location")).toHaveTextContent("color=FFFF00")

  const blue = screen.getByLabelText("파랑(B)")
  fireEvent.change(blue, { target: { value: "300" } })
  fireEvent.blur(blue)
  expect(screen.getByRole("alert")).toHaveTextContent("255로 바꿨습니다")
  expect(status()).toHaveTextContent("하양")
})

it("16진수 코드를 입력해 색을 정하고, 잘못된 코드는 알려 준다", () => {
  open()
  const field = screen.getByLabelText("16진수 색 코드로 입력")
  expect(field).toHaveValue("#2B6BE6")
  fireEvent.change(field, { target: { value: "#f80" } })
  fireEvent.keyDown(field, { key: "Enter" })
  expect(status()).toHaveTextContent("R 255 · G 136 · B 0 → #FF8800")
  expect(screen.getByLabelText("빨강(R)")).toHaveValue(255)
  fireEvent.change(field, { target: { value: "hello" } })
  fireEvent.blur(field)
  expect(screen.getByRole("alert")).toHaveTextContent("색 코드는 #과 0~9, A~F로 된 여섯 글자입니다")
  expect(status()).toHaveTextContent("#FF8800")
})

it("자주 쓰는 색 버튼", () => {
  open()
  fireEvent.click(screen.getByRole("button", { name: "청록" }))
  expect(status()).toHaveTextContent("청록: R 0 · G 255 · B 255 → #00FFFF")
})

it("픽셀을 살펴보고 칠하며, 크기를 계산한다", () => {
  open("view=pixels")
  expect(status()).toHaveTextContent("64픽셀 × 24비트 = 1,536비트(192바이트)")
  fireEvent.click(pixel(2, 1))
  expect(pixel(2, 1)).toHaveAttribute("aria-pressed", "true")
  const info = screen.getByText("2행 1열 픽셀").parentElement!
  expect(within(info).getByText("#FF0000")).toBeInTheDocument()
  expect(within(info).getByText("11111111")).toBeInTheDocument()

  fireEvent.click(screen.getByRole("button", { name: "칠하기" }))
  fireEvent.click(screen.getByRole("button", { name: "파랑" }))
  fireEvent.click(pixel(1, 1))
  expect(pixel(1, 1)).toHaveAccessibleName("1행 1열, #0000FF")
})

it("RGB 탭에서 만든 색을 붓으로 쓴다", () => {
  open("view=pixels&color=123456")
  fireEvent.click(screen.getByRole("button", { name: "칠하기" }))
  fireEvent.click(screen.getByRole("button", { name: "RGB 탭에서 만든 색" }))
  fireEvent.click(pixel(8, 8))
  expect(pixel(8, 8)).toHaveAccessibleName("8행 8열, #123456")
})

it("흑백 1비트로 바꾸면 비트와 용량이 달라진다", () => {
  open("view=pixels")
  fireEvent.click(screen.getByRole("button", { name: "흑백 1비트" }))
  expect(screen.getByTestId("location")).toHaveTextContent("depth=bw")
  expect(status()).toHaveTextContent("64픽셀 × 1비트 = 64비트(8바이트)")
  // 하트: 흰 바탕은 1, 빨강은 어두워서 0
  expect(pixel(1, 1)).toHaveAccessibleName("1행 1열, 1")
  expect(pixel(1, 2)).toHaveAccessibleName("1행 2열, 0")
  expect(screen.getByRole("list", { name: "줄마다 저장되는 비트" }).firstChild).toHaveTextContent(
    "1001 1001",
  )
  fireEvent.click(screen.getByRole("button", { name: "빈 도화지" }))
  expect(pixel(1, 2)).toHaveAccessibleName("1행 2열, 1")
})
