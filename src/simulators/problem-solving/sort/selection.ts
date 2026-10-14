interface SelectionStep {
  kind: "compare" | "place"
  output: number[]
  remaining: number[]
  candidate: number
  compared?: [number, number]
}

/** 작은 묶음 안에서 최솟값을 한 장씩 찾아 정리한다. */
export function createAllCardsTrace(papers: readonly number[]) {
  const remaining = [...papers]
  const output: number[] = []
  const trace: SelectionStep[] = []
  while (remaining.length) {
    let minimum = 0
    for (let index = 1; index < remaining.length; index += 1) {
      const compared: [number, number] = [remaining[minimum], remaining[index]]
      if (remaining[index] < remaining[minimum]) minimum = index
      trace.push({
        kind: "compare",
        output: [...output],
        remaining: [...remaining],
        candidate: remaining[minimum],
        compared,
      })
    }
    const [candidate] = remaining.splice(minimum, 1)
    output.push(candidate)
    trace.push({ kind: "place", output: [...output], remaining: [...remaining], candidate })
  }
  return { trace, sorted: output }
}
