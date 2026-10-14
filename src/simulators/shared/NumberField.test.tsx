import { useState } from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { NumberField } from "./NumberField"

afterEach(cleanup)

function CountField({ maxNote }: { maxNote?: string }) {
  const [value, setValue] = useState(5)
  return (
    <>
      <NumberField
        label="개수"
        value={value}
        min={1}
        max={10}
        maxNote={maxNote}
        onCommit={setValue}
      />
      <button onClick={() => setValue(3)}>다른 값</button>
    </>
  )
}

it("공용 입력은 범위로 보정하고 8비트 대신 입력 범위를 안내한다", () => {
  render(<CountField />)
  const field = screen.getByLabelText("개수")
  fireEvent.change(field, { target: { value: "20" } })
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  fireEvent.blur(field)
  expect(field).toHaveValue(10)
  expect(screen.getByRole("alert")).toHaveTextContent("1~10 사이의 정수를 입력해 주세요.")
  expect(screen.getByRole("alert")).not.toHaveTextContent("8비트")
  expect(field).toHaveAttribute("aria-describedby", screen.getByRole("alert").id)
  fireEvent.click(screen.getByRole("button", { name: "다른 값" }))
  expect(field).toHaveValue(3)
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
})

it("사용하는 화면이 전달한 제한 이유를 표시한다", () => {
  render(<CountField maxNote="한 번에 10개까지 고를 수 있습니다." />)
  const field = screen.getByLabelText("개수")
  fireEvent.change(field, { target: { value: "11" } })
  fireEvent.blur(field)
  expect(screen.getByRole("alert")).toHaveTextContent("한 번에 10개까지 고를 수 있습니다.")
  expect(screen.getByRole("alert")).not.toHaveTextContent("1~10 사이")
})
