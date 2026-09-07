import { init, weigh } from "./core"
import { sequentialMax } from "./theory"
import { sequentialWorst } from "./worstCase"
import type { Algorithm } from "./types"
export const sequentialPair: Algorithm = {
  id: "sequential-pair",
  name: "차례로 비교하기",
  bigO: "O(N)",
  maxComparisons: sequentialMax,
  worstCaseFakeIndex: sequentialWorst,
  init,
  step(state) {
    if (state.finished) return state
    const [left, right, ...outside] = state.candidates
    return { ...weigh(state, [left!], [right!], outside), cursor: state.cursor + 2 }
  },
}
