import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { DataRepresentationPage } from "."

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function open(query = "") {
  return render(
    <MemoryRouter initialEntries={[`/units/data/data-representation${query ? `?${query}` : ""}`]}>
      <DataRepresentationPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const tab = (name: string) => screen.getByRole("tab", { name })

afterEach(cleanup)

it("문자·그림·소리 탭을 오가며 각 탭의 설정은 주소에 남기고 보기는 지운다", () => {
  open("kind=text&view=decode&code=66")
  expect(tab("문자")).toHaveAttribute("aria-selected", "true")
  expect(screen.getByRole("button", { name: "이진수 → 문자" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )

  fireEvent.click(tab("그림"))
  expect(screen.getByRole("button", { name: "RGB로 색 만들기" })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  expect(screen.getByTestId("location")).not.toHaveTextContent("view=")

  fireEvent.click(tab("소리"))
  expect(screen.getByRole("list", { name: "변환 단계" })).toBeInTheDocument()

  fireEvent.click(tab("문자"))
  expect(screen.getByTestId("location")).toHaveTextContent("code=66")
})

it("방향키로 탭을 옮기고, 잘못된 kind는 문자 탭으로 연다", () => {
  open("kind=video")
  expect(tab("문자")).toHaveAttribute("aria-selected", "true")
  fireEvent.keyDown(tab("문자"), { key: "ArrowLeft" })
  expect(tab("소리")).toHaveAttribute("aria-selected", "true")
  expect(screen.getByTestId("location")).toHaveTextContent("kind=sound")
})
