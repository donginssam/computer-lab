import { cleanup, fireEvent, screen } from "@testing-library/react"
import { useNavigate } from "react-router"
import { afterEach, expect, it } from "vitest"
import { renderWithRouter } from "../../test/renderWithRouter"
import { useSimulatorParams } from "./useSimulatorParams"

afterEach(cleanup)

function Settings() {
  const { change } = useSimulatorParams()
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => change({ code: "66" })}>코드 변경</button>
      <button onClick={() => change({ kind: "image", view: null }, false)}>그림 탭</button>
      <button onClick={() => change({ color: "FF0000", t: "" })}>색 변경</button>
      <button onClick={() => navigate(-1)}>뒤로</button>
      <button onClick={() => navigate(1)}>앞으로</button>
    </>
  )
}

it("설정은 이력을 대체하고 탭 이동만 추가하며, 삭제와 빈 문자열을 구분한다", () => {
  renderWithRouter(<Settings />, "/?kind=text&view=decode&code=65&keep=a&keep=b")
  const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }))
  const search = () => new URLSearchParams(screen.getByTestId("location").textContent!)

  click("코드 변경")
  click("그림 탭")
  expect(search().has("view")).toBe(false)
  expect(search().get("code")).toBe("66")
  expect(search().getAll("keep")).toEqual(["a", "b"])
  click("색 변경")
  expect(search().has("t")).toBe(true)
  expect(search().get("t")).toBe("")

  click("뒤로")
  expect(search().get("kind")).toBe("text")
  expect(search().get("view")).toBe("decode")
  expect(search().get("code")).toBe("66")
  expect(search().has("color")).toBe(false)

  click("앞으로")
  expect(search().get("kind")).toBe("image")
  expect(search().get("color")).toBe("FF0000")
  expect(search().has("view")).toBe(false)
})
