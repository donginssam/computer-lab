import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mergeRecords } from "../../shared/records"
import { useRecords } from "../../shared/useRecords"
import { readRecords, STORAGE_KEY, type Experiment } from "./records"

const records: Experiment[] = [
  { id: "lock", strategy: "lock", digits: 2, placement: "worst", secret: 99, attempts: 100 },
  {
    id: "change",
    strategy: "change",
    amount: 120,
    coinSet: "labA",
    coins: [100, 60, 10],
    greedyCount: 3,
    optimalCount: 2,
    stuck: false,
  },
  { id: "sort", strategy: "sort", n: 8, order: "worst", comparisons: 17 },
]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe("문제 해결 전략 기록", () => {
  it("세 전략 형식을 검증하고 손상된 값은 제외한다", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([null, {}, ...records, { ...records[0], attempts: 99 }]),
    )
    expect(readRecords()).toEqual(records)
    localStorage.setItem(STORAGE_KEY, "broken")
    expect(readRecords()).toEqual([])
  })

  it("중복을 제외하고 최근 500개만 남긴다", () => {
    const current = Array.from({ length: 500 }, (_, index) => ({
      ...records[0],
      id: String(index),
    }))
    const merged = mergeRecords(current, [current[0], records[1], records[1]])
    expect(merged).toHaveLength(500)
    expect(merged[0].id).toBe("1")
    expect(merged.at(-1)).toEqual(records[1])
  })

  it("저장 실패를 알리고 다음 저장에서 복구한다", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const { result } = renderHook(() => useRecords(STORAGE_KEY, readRecords))
    act(() => result.current.save([records[0]]))
    expect(result.current.records).toEqual([records[0]])
    expect(result.current.storageError).toBe(true)
    write.mockRestore()
    act(() => result.current.save([records[1]]))
    expect(result.current.storageError).toBe(false)
    expect(readRecords()).toHaveLength(2)
    act(() => result.current.remove("lock"))
    expect(readRecords()).toEqual([records[1]])
    act(() => result.current.clear())
    expect(readRecords()).toEqual([])
  })
})
