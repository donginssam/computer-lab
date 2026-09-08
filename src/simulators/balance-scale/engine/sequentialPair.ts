import { init, weigh } from "./core"
import { sequentialMax } from "./theory"
import { sequentialWorst } from "./worstCase"
import type { Algorithm } from "./types"
export const sequentialPair: Algorithm = {
  id: "sequential-pair",
  name: "차례로 비교하기",
  shortName: "차례로",
  bigO: "O(N)",
  bigOPlain: "동전이 2배가 되면 저울질도 2배로 늘어요",
  maxComparisons: sequentialMax,
  worstCaseFakeIndex: sequentialWorst,
  init,
  step(state) {
    if (state.finished) return state
    const [left, right, ...outside] = state.candidates
    return { ...weigh(state, [left!], [right!], outside), cursor: state.cursor + 2 }
  },
}
