import { init, weigh } from "./core"
import { divideMax } from "./theory"
import { divideWorst } from "./worstCase"
import type { Algorithm } from "./types"
export const divideHalf: Algorithm = {
  id: "divide-half",
  name: "절반씩 나누기",
  bigO: "O(log N)",
  maxComparisons: divideMax,
  worstCaseFakeIndex: divideWorst,
  init,
  step(state) {
    if (state.finished) return state
    const half = Math.floor(state.candidates.length / 2)
    return weigh(
      state,
      state.candidates.slice(0, half),
      state.candidates.slice(half, half * 2),
      state.candidates.slice(half * 2),
    )
  },
}
