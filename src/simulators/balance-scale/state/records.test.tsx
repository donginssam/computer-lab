import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { ExperimentTable } from "../components/ExperimentTable"
import { useState } from "react"
import { mergeRecords } from "../../shared/records"
import { useRecords } from "../../shared/useRecords"
import { readRecords, STORAGE_KEY, type Experiment } from "./records"
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
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
it("기존 기록과 같은 묶음의 중복을 제외하고 최근 500개를 남긴다", () => {
  const current = Array.from({ length: 500 }, (_, i) => ({ ...record, id: String(i) }))
  const merged = mergeRecords(current, [current[0], record, record])
  expect(merged).toHaveLength(500)
  expect(merged[0].id).toBe("1")
  expect(merged.at(-1)).toEqual(record)
  expect(current).toHaveLength(500)
  expect(current[0].id).toBe("0")
})

it("저장이 차단되어도 기록을 유지하고 다음 저장 성공 시 복구한다", () => {
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage unavailable")
  })
  const { result, unmount } = renderHook(() => useRecords(STORAGE_KEY, readRecords))
  act(() => result.current.save([record]))
  expect(result.current.records).toEqual([record])
  expect(result.current.storageError).toBe(true)

  write.mockRestore()
  act(() => result.current.save([{ ...record, id: "second" }]))
  expect(result.current.storageError).toBe(false)
  expect(readRecords()).toHaveLength(2)
  unmount()

  const restored = renderHook(() => useRecords(STORAGE_KEY, readRecords))
  expect(restored.result.current.records).toHaveLength(2)
  act(() => restored.result.current.remove(record.id))
  expect(readRecords().map(item => item.id)).toEqual(["second"])
  act(() => restored.result.current.clear())
  expect(readRecords()).toEqual([])
})

it("저장 형식을 검증하고 최대 500개까지만 읽는다", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      null,
      {},
      { ...record, fakeIndex: 9 },
      { ...record, id: "too-many", comparisons: 4 },
      record,
    ]),
  )
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
