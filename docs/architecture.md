# 아키텍처

[문서 목록](README.md) · [양팔저울 구현](theory/balance-scale.md)

## 책임 분리

단원 메타데이터로 홈과 단원 목록을 구성하고, 라우터가 각 페이지를 연결합니다. 시뮬레이터는 UI 의존성이 없는 엔진, 실행 상태, 화면 컴포넌트로 나눕니다.

```text
src/
├── main.tsx                        앱 진입점
├── router.tsx                      Browser Router와 basename
├── index.css                       공통 테마·서체·포커스
├── content/units.ts                5개 단원과 시뮬레이터 메타데이터
├── components/
│   ├── layout/                     AppShell, Header, Footer, Breadcrumb
│   └── ui/                         UnitTile, SimulatorCard, StatusBadge
├── pages/                          HomePage, UnitPage, NotFoundPage
├── simulators/balance-scale/
│   ├── index.tsx                   URL·모드·저장·화면 조립
│   ├── copy.ts                     공통 학생용 용어와 상태 라벨
│   ├── simulator.css               시뮬레이터 레이아웃과 저울 모션
│   ├── engine/                     타입·저울 판정·알고리즘·이론값
│   ├── state/                      reducer·타이머 훅·저장 형식
│   └── components/                 설정·저울·결과·비교·표·그래프·개념
└── test/setup.ts                   테스트 환경 초기화
```

`StatsBar`, `CoinGrid`, `StepLog`는 [SimulationView.tsx](../src/simulators/balance-scale/components/SimulationView.tsx)에 함께 정의되어 있습니다.

## 페이지와 경로

| 경로                             | 페이지 / 상태                        |
| -------------------------------- | ------------------------------------ |
| `/`                              | 홈: 단원 타일과 시뮬레이터 안내      |
| `/units/computing-system`        | 컴퓨팅 시스템, 시뮬레이터 준비 중    |
| `/units/data`                    | 데이터, 시뮬레이터 준비 중           |
| `/units/algorithm`               | 알고리즘과 프로그래밍, 양팔저울 진입 |
| `/units/ai`                      | 인공지능, 시뮬레이터 준비 중         |
| `/units/digital-culture`         | 디지털 문화, 시뮬레이터 준비 중      |
| `/units/algorithm/balance-scale` | 양팔저울 시뮬레이터                  |
| 일치하지 않는 경로               | NotFoundPage                         |

[router.tsx](../src/router.tsx)는 `AppShell` 아래 중첩 라우트를 선언합니다. `basename`은 `import.meta.env.BASE_URL`에서 마지막 `/`를 제거한 값입니다. 프로젝트 하위 배포에서는 [배포 설정](deployment.md)과 일치해야 합니다.

## 메타데이터

[units.ts](../src/content/units.ts)의 `Unit`은 `id`, `order`, `title`, `lead`, `blurb`, `color`, `simulators`를 가집니다. `SimulatorMeta`는 `slug`, `title`, `summary`, `status`로 구성됩니다.

상태는 `ready`(해 보기), `in-progress`(만드는 중), `coming-soon`(준비 중)입니다. `unitPath`와 `simulatorPath`가 링크 경로를 만들지만 **페이지 라우트를 자동 등록하지는 않습니다**.

## 데이터 흐름

```text
URL 설정 → BalanceScalePage → Simulation → useSimulation
                                         ↓
                                      reducer → 순수 엔진
                                         ↓
                              저울·횟수·후보·단계 기록
                                         ↓ 완료
                           Experiment[] → localStorage
                                         ↓
                                실험 표 + 지연 로딩 그래프
```

무작위 위치 생성, 타이머, 브라우저 저장은 엔진 밖에서 처리합니다. 비교 모드는 같은 가짜 동전 위치로 생성한 두 엔진 상태를 사용합니다. Recharts 컴포넌트는 기록 탭에서 `lazy`와 `Suspense`로 불러옵니다.

## 새 시뮬레이터 추가

1. `src/simulators/<slug>/`에 페이지 진입점과 필요한 `engine/`, `state/`, `components/`를 만듭니다.
2. `src/content/units.ts`의 해당 단원에 고유한 slug와 상태·제목·요약을 추가합니다.
3. `src/router.tsx`에 `units/<unitId>/<slug>` 경로와 페이지를 명시적으로 연결합니다.
4. 공용 `Breadcrumb`, 단원 색 `--unit`, [용어·접근성 기준](ui-guidelines.md)을 적용합니다.
5. 엔진의 입력·종료 조건과 사용자 동작을 검증하고 홈·단원 링크·직접 진입을 확인합니다.
6. 시뮬레이터의 이론과 구현 문서를 `docs/theory/`에 추가하고 [문서 목록](README.md)을 갱신합니다.
