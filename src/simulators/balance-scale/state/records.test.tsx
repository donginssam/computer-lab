import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { ExperimentTable } from "../components/ExperimentTable"
import { useState } from "react"
import { readRecords, STORAGE_KEY, type Experiment } from "./records"
afterEach(() => {
  cleanup()
  localStorage.clear()
})
const record: Experiment = {
  id: "test",
  n: 8,
  algorithm: "divide-half",
  fakePlacement: "worst",
  fakeIndex: 7,
  comparisons: 3,
}
it("저장 형식을 검증하고 최대 500개까지만 읽는다", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([null, {}, { ...record, fakeIndex: 9 }, record]))
  expect(readRecords()).toEqual([record])
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(Array.from({ length: 501 }, (_, i) => ({ ...record, id: String(i) }))),
  )
  expect(readRecords()).toHaveLength(500)
  expect(readRecords()[0]?.id).toBe("1")
})
it("기록을 개별 또는 전체 삭제할 수 있다", () => {
  function Table() {
    const [records, setRecords] = useState([record, { ...record, id: "test2", n: 16 }])
    return (
      <ExperimentTable
        records={records}
        remove={id => setRecords(old => old.filter(r => r.id !== id))}
        clear={() => setRecords([])}
      />
    )
  }
  render(<Table />)
  fireEvent.click(
    screen.getByRole("button", { name: "동전 8개 절반씩 나누기 저울질 3회 기록 삭제" }),
  )
  expect(screen.getByRole("heading", { name: "실험 기록 (1)" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "전체 삭제" }))
  expect(screen.getByRole("heading", { name: "실험 기록 (0)" })).toBeInTheDocument()
})
