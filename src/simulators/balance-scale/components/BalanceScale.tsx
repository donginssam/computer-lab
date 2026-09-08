import type { Weighing } from "../engine/types"
import { resultLabel, coinList } from "../copy"
function Pan({ x, ids }: { x: number; ids: number[] }) {
  const size = ids.length <= 3 ? 24 : ids.length <= 8 ? 20 : ids.length <= 20 ? 16 : 12
  const cols = Math.floor(112 / (size + 2))
  return (
    <g transform={`translate(${x},0)`}>
      <path d="M0 80 L-62 192 L62 192 Z" fill="none" stroke="#4b5670" strokeWidth="2" />
      <path d="M-66 192 Q0 219 66 192" fill="#dce7fc" stroke="#16213a" strokeWidth="3" />
      {ids.map((id, i) => (
        <g
          key={id}
          transform={`translate(${-(Math.min(cols, ids.length - Math.floor(i / cols) * cols) * (size + 2) - 2) / 2 + (i % cols) * (size + 2)},${188 - (Math.floor(i / cols) + 1) * (size + 2)})`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 0.75}
            fill="#2b6be6"
            stroke="#173d8c"
            strokeWidth="1.5"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.36}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.55"
          />
          {ids.length <= 20 && (
            <text
              x={size / 2}
              y={size * 0.74}
              textAnchor="middle"
              fontSize={size * 0.62}
              fill="white"
            >
              {id + 1}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}
export function BalanceScale({ weighing }: { weighing?: Weighing }) {
  // In SVG coordinates positive rotation lifts the LEFT end of the beam.
  const angle = weighing?.result === "left" ? 8 : weighing?.result === "right" ? -8 : 0
  return (
    <div className="scale-wrap">
      <svg
        viewBox="0 0 480 260"
        role="img"
        aria-label={
          weighing
            ? `${resultLabel[weighing.result]}. 왼쪽 동전 ${coinList(weighing.left)}, 오른쪽 동전 ${coinList(weighing.right)}`
            : "저울질을 기다리는 양팔저울"
        }
      >
        <path d="M240 75 L210 235 H270 Z" fill="#ffd23f" stroke="#16213a" strokeWidth="3" />
        <path d="M190 238 H290" stroke="#16213a" strokeWidth="6" strokeLinecap="round" />
        <g
          className="scale-beam"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: "240px 80px" }}
        >
          <path d="M92 80 H388" stroke="#16213a" strokeWidth="7" strokeLinecap="round" />
          <Pan x={100} ids={weighing?.left ?? []} />
          <Pan x={380} ids={weighing?.right ?? []} />
        </g>
        <circle cx="240" cy="80" r="9" fill="#f0671f" stroke="#16213a" strokeWidth="2" />
        <text x="100" y="25" textAnchor="middle" fontSize="16">
          왼쪽 {weighing?.left.length ?? 0}개
        </text>
        <text x="380" y="25" textAnchor="middle" fontSize="16">
          오른쪽 {weighing?.right.length ?? 0}개
        </text>
      </svg>
      <p className="outside">
        저울 밖 후보: {weighing?.outside.length ? coinList(weighing.outside) : "없음"}
      </p>
    </div>
  )
}
