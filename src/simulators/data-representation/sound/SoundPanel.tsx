import { useMemo } from "react"
import type { ChangeParams } from "../../shared/useSimulatorParams"
import { clampedParam, clampInteger, oneOfParam } from "../../shared/params"
import { RunControls } from "../../shared/RunControls"
import { useStepRun } from "../../shared/useStepRun"
import { soundCopy, stages } from "./copy"
import { BITS_MAX, BITS_MIN, SAMPLES_MAX, SAMPLES_MIN, digitize, waves, waveIds } from "./engine"
import { SoundSettings } from "./SoundSettings"
import { SoundProcess } from "./SoundProcess"
import { SoundConcepts } from "./SoundConcepts"
import "./simulator.css"

export function SoundPanel({ params, change }: { params: URLSearchParams; change: ChangeParams }) {
  const waveId = oneOfParam(params.get("wave"), waveIds, "smooth")
  const count = clampedParam(params.get("n"), 12, value =>
    clampInteger(value, SAMPLES_MIN, SAMPLES_MAX),
  )
  const bits = clampedParam(params.get("bits"), 3, value => clampInteger(value, BITS_MIN, BITS_MAX))
  const wave = waves[waveId]
  const samples = useMemo(() => digitize(wave, count, bits), [wave, count, bits])
  // 설정을 바꿔도 단계는 그대로 두어, 같은 단계에서 무엇이 달라지는지 바로 비교하게 한다.
  const { tick: stage, controls } = useStepRun(stages.length - 1)

  return (
    <div className="sound-page">
      <p className="data-lead">{soundCopy.lead}</p>
      <SoundSettings waveId={waveId} count={count} bits={bits} change={change} />
      <RunControls {...controls} />
      <SoundProcess wave={wave} samples={samples} bits={bits} stage={stage} />
      <SoundConcepts />
    </div>
  )
}
