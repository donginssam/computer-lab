# 양팔저울 구현

[문서 목록](../README.md) · [화면 규칙](../ui-guidelines.md)

## 문제와 엔진 계약

N개의 동전 중 **진짜보다 가벼운 가짜 동전이 정확히 하나** 존재합니다. 양쪽에 같은 수를 올려 저울 결과를 판정합니다. 내부 `CoinId`와 `fakeIndex`는 0부터 시작하고 화면 번호는 1을 더합니다.

[engine/types.ts](../../src/simulators/balance-scale/engine/types.ts)의 `Algorithm`은 `id`, `name`, `shortName`, `bigO`, `bigOPlain`, `maxComparisons`, `worstCaseFakeIndex`, `init`, `step`을 제공합니다. `SimState`는 전체 수·가짜 위치·후보·비교 횟수·저울질 이력·종료 여부·답·커서를 보관합니다.

[core.ts](../../src/simulators/balance-scale/engine/core.ts)의 역할:

- `init(n, fakeIndex)`: 정수 N=2~100, 범위 내 정수 위치를 검증하고 초기 상태를 만듭니다.
- `tilt(left, right, fakeIndex)`: 양쪽 동전 수가 다르면 오류를 냅니다. 가짜 동전이 왼쪽이면 `left`, 오른쪽이면 `right`, 밖에 있으면 `balanced`입니다.
- `weigh(...)`: 한 번의 저울질을 이력에 추가하고 결과에 맞는 후보만 남깁니다. 후보가 하나면 같은 단계에서 답을 확정합니다.

배열의 중복·교집합 같은 임의 배치는 `tilt`에서 검증하지 않습니다. 현재 두 엔진이 유효한 후보 분할을 만들어 호출한다는 전제입니다. 직접 배치 기능을 도입한다면 별도의 배치 검증이 필요합니다.

## 두 알고리즘

| 항목             | 차례로 비교하기                    | 절반씩 나누기                                               |
| ---------------- | ---------------------------------- | ----------------------------------------------------------- |
| ID               | `sequential-pair`                  | `divide-half`                                               |
| 한 단계          | 후보 첫 두 개를 하나씩 양쪽에 올림 | 후보를 같은 크기의 두 묶음으로 나누고 홀수면 하나는 밖에 둠 |
| 양쪽이 같을 때   | 두 후보를 제외하고 나머지를 유지   | 저울 밖 한 개가 가짜 동전                                   |
| 기울었을 때      | 가벼운 쪽 한 개가 가짜 동전        | 가벼운 묶음만 유지                                          |
| 정확한 최악 횟수 | `⌊N/2⌋`                            | `⌊log₂N⌋`                                                   |
| 시간 복잡도 표현 | `O(N)`                             | `O(log N)`                                                  |

두 `step`은 입력을 변경하지 않습니다. 종료 상태에 다시 호출하면 같은 상태 객체를 반환합니다. 순차 알고리즘의 `cursor`는 2씩 증가하지만 실제 다음 짝은 `candidates`에서 선택합니다.

절반씩 나누기의 최악 경로는 후보 수를 매번 `floor(N/2)`로 줄입니다. N=7이면 7 → 3 → 1로 2회입니다. `⌈log₂N⌉`은 느슨한 상한이며 현재 그래프와 `theory.ts`에는 사용하지 않습니다. `⌈log₃N⌉`은 세 결과를 활용하는 최적 전략의 보장 횟수로, 현재 절반씩 나누기 엔진의 횟수가 아닙니다.

## 가짜 동전 위치

[worstCase.ts](../../src/simulators/balance-scale/engine/worstCase.ts)는 순차 최악 위치를 짝수 N에서 `n-1`, 홀수 N에서 `n-2`로 정합니다. 절반 나누기는 오른쪽 절반을 계속 따라가는 위치를 계산합니다.

[useSimulation.ts](../../src/simulators/balance-scale/state/useSimulation.ts)의 `chooseFake`는 단일 모드에서 선택한 알고리즘의 최악 위치를 사용합니다. 나란히 비교는 `WORST_CASE_BASELINE = "sequential-pair"`로 고정합니다. 무작위 옵션은 두 모드 모두 `Math.floor(Math.random() * n)`입니다.

비교 모드가 두 알고리즘 각각의 최악 성능을 동시에 재현하는 것은 아닙니다. 동시에 최악인 위치가 없는 N도 있습니다(예: N=22). 같은 위치에서 방법을 비교하는 것이 목적입니다. N=100의 순차 최악 위치인 100번 동전에서는 차례로 50회, 절반씩 3회가 걸립니다. 절반씩 나누기의 표시 상한은 6회이므로 실제 결과 3회와 구분합니다.

## 실행 상태와 생명주기

[state/reducer.ts](../../src/simulators/balance-scale/state/reducer.ts)의 `RunState`는 `options`, 두 알고리즘의 `pair`, `running`, `speed`, 공통 시간축 `tick`, `runId`를 가집니다.

| 액션 / 변화           | 동작                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| `step`                | 단일 알고리즘 또는 두 알고리즘을 한 단계 진행하고 모두 끝나면 자동 정지 |
| `back`                | 초기 상태부터 이전 tick까지 재실행해 복원, 자동 실행 정지               |
| `auto`                | 자동 실행 여부 설정                                                     |
| `speed`               | 실행 간격 변경                                                          |
| `reset`               | 새 가짜 위치와 runId로 초기화, 현재 속도 유지                           |
| 모드·N·위치 옵션 변경 | 페이지의 `Simulation` key 변경으로 재마운트, 새 실험 시작               |
| 알고리즘 변경         | 단일 모드에서는 재마운트, 비교 모드 key에는 포함하지 않음               |

자동 실행은 `useEffect`의 `setTimeout` 체인입니다. 정지·속도 변경·다음 tick·언마운트 시 이전 타이머를 정리합니다. 재마운트 시 속도는 기본 800ms로 돌아갑니다. 되감기는 기존 실험 기록을 지우지 않습니다.

## URL 계약

[index.tsx](../../src/simulators/balance-scale/index.tsx)에서 쿼리를 읽습니다.

| 쿼리        | 값 / 기본 동작                                                     |
| ----------- | ------------------------------------------------------------------ |
| `mode`      | `simulation`, `compare`, `records`; 그 외는 `simulation`           |
| `n`         | 생략하면 7, 유한 숫자는 정수 절삭 후 2~100으로 보정, 비유한 값은 7 |
| `algorithm` | `divide-half` 외에는 `sequential-pair`                             |
| `placement` | `random` 외에는 `worst`                                            |

숫자 입력 컨트롤은 Enter/blur 때 값을 확정하며 빈 값이나 0은 7로 처리한 후 범위를 제한합니다. URL의 빈 문자열은 숫자 변환 결과 0이므로 2로 제한됩니다. 화면이 잘못된 쿼리를 해석해 보정하더라도 모든 값을 즉시 URL에 다시 쓰는 것은 아닙니다.

모드 변경은 브라우저 이력에 추가하고 다른 설정은 `replace`로 갱신합니다. 진행 상태·runId·가짜 동전의 실제 위치·실험 기록은 URL에 저장하지 않습니다.

## 실험 기록

[state/records.ts](../../src/simulators/balance-scale/state/records.ts)의 `Experiment` 필드:

| 필드            | 의미                                      |
| --------------- | ----------------------------------------- |
| `id`            | `runId:algorithm` 형식의 중복 방지 식별자 |
| `n`             | 동전 수                                   |
| `algorithm`     | 알고리즘 ID                               |
| `fakePlacement` | `worst` 또는 `random`                     |
| `fakeIndex`     | 가짜 동전의 0 기반 위치                   |
| `comparisons`   | 실제 저울질 횟수                          |

저장 키는 `computer-lab.balance-scale.v1`입니다. 각 알고리즘이 완료될 때 저장하므로 비교 모드는 먼저 끝난 결과도 먼저 기록합니다. 실행 내부의 Set과 기존 기록의 ID 검사로 되감기 후 중복 저장을 막고 최근 500개만 유지합니다.

읽을 때 JSON 배열 여부, 필드 타입·허용값·범위를 검사합니다. 횟수 검증은 공통 범위 `1..floor(n/2)`이며 알고리즘별 상한이나 실제 재실행 결과까지 검증하지 않습니다. 손상된 JSON은 빈 배열로 처리하고 유효하지 않은 행은 제외합니다. 쓰기 실패 시 기록 탭에서 임시 저장 상태를 안내합니다. CSV 내보내기·기기 간 동기화는 없습니다.

[ComplexityChart.tsx](../../src/simulators/balance-scale/components/ComplexityChart.tsx)는 N=2~100의 정확한 최악 횟수 두 선과 알고리즘별 실험점을 그립니다. 선 패턴·점 모양·문구 범례로 구분하며 표가 실험점의 대체 정보를 제공합니다.
