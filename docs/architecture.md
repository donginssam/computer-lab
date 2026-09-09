# 아키텍처

[문서 목록](README.md) · [양팔저울 이론](theory/balance-scale.md) · [문제 해결 전략 이론](theory/problem-solving.md)

## 책임 분리

단원 메타데이터로 홈과 단원 목록을 구성하고, 라우터가 각 페이지를 연결합니다. 시뮬레이터는 UI 의존성이 없는 엔진, 실행 상태, 화면 컴포넌트로 나눕니다.

```text
src/
├── main.tsx                        앱 진입점
├── router.tsx                      Browser Router와 basename
├── index.css                       공통 테마·서체·포커스
├── content/units.ts                5개 단원과 시뮬레이터 메타데이터
├── components/
│   ├── PwaUpdatePrompt.tsx         새 버전 알림
│   ├── layout/                     AppShell, Header, Footer, Breadcrumb
│   └── ui/                         UnitTile, SimulatorCard, StatusBadge
├── pages/                          HomePage, UnitPage, NotFoundPage
├── simulators/balance-scale/
│   ├── index.tsx                   URL 설정·모드 선택·화면 조립
│   ├── copy.ts                     공통 학생용 용어와 상태 라벨
│   ├── simulator.css               시뮬레이터 레이아웃과 저울 모션
│   ├── engine/                     타입·저울 판정·알고리즘·이론값
│   ├── state/                      reducer·실행 훅·기록 저장 훅·저장 형식
│   └── components/                 설정·저울·결과·비교·표·그래프·개념
├── simulators/problem-solving/
│   ├── index.tsx                   전략 URL·직접 입력·화면 조립
│   ├── strategies.ts · copy.ts     전략 탭과 학생용 공통 문구
│   ├── simulator.css               자물쇠·동전·카드 장면과 반응형 배치
│   ├── shared/                     공용 실행기·기록·표·그래프·질문
│   ├── lock/                       시행착오 자물쇠 엔진과 화면
│   ├── change/                     욕심쟁이 거스름돈 엔진과 화면
│   └── sort/                       합병 정렬 trace 엔진과 화면
└── test/setup.ts                   테스트 환경 초기화
```

`StatsBar`, `CoinGrid`, `StepLog`는 [SimulationView.tsx](../src/simulators/balance-scale/components/SimulationView.tsx)에 함께 정의되어 있습니다.

[vite.config.ts](../vite.config.ts)는 manifest와 Workbox 서비스 워커를 생성합니다. [main.tsx](../src/main.tsx)의 `PwaUpdatePrompt`가 서비스 워커를 등록하고 새 버전이 있을 때 알립니다. 설치 아이콘은 `public/`, 빌드 산출물 검사는 [verify-pwa.mjs](../scripts/verify-pwa.mjs)에 있습니다.

## 페이지와 경로

| 경로                               | 페이지 / 상태                          |
| ---------------------------------- | -------------------------------------- |
| `/`                                | 홈: 단원 타일과 시뮬레이터 안내        |
| `/units/computing-system`          | 컴퓨팅 시스템, 시뮬레이터 준비 중      |
| `/units/data`                      | 데이터, 시뮬레이터 준비 중             |
| `/units/algorithm`                 | 알고리즘과 프로그래밍, 시뮬레이터 목록 |
| `/units/ai`                        | 인공지능, 시뮬레이터 준비 중           |
| `/units/digital-culture`           | 디지털 문화, 시뮬레이터 준비 중        |
| `/units/algorithm/balance-scale`   | 양팔저울 시뮬레이터                    |
| `/units/algorithm/problem-solving` | 문제 해결 전략 실험실                  |
| 일치하지 않는 경로                 | NotFoundPage                           |

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

`Simulation`은 실행 제어와 완료 기록 수집을 담당하고, `ModeTabs`는 모드 선택과 키보드 이동을 담당합니다. `useRecords`는 저장·삭제와 저장 실패 상태를 관리합니다. `mergeRecords`는 ID 중복을 제거하고 공통 제한 `MAX_RECORDS`에 맞춰 최신 기록만 남깁니다.

문제 해결 전략 실험실은 세 엔진을 하나씩 같은 실행기에 연결합니다. `shared/stepper.ts`의 reducer가 tick 단위 진행과 되감기를 맡고, 각 전략의 `Experiment` 컴포넌트가 완료 결과를 한 번만 기록합니다. 자물쇠는 한 tick에 여러 시도를 묶을 수 있고, 합병 정렬은 초기화할 때 만든 짧은 trace의 현재 위치만 이동합니다. 기록은 `strategy` 판별 필드가 있는 합 타입으로 저장하며 그래프는 기록 탭에서만 지연 로딩합니다.

```text
URL 설정 → ProblemSolvingPage → 전략 Experiment → 공용 stepper → 순수 엔진
                                      ↓ 완료
                          전략별 Experiment → localStorage
                                      ↓
                               기록 표 + 지연 로딩 그래프
```

직접 입력한 비밀번호·카드, 무작위 결과, 현재 진행 단계는 URL에 넣지 않습니다. `docs/`와 개발 계획 파일은 앱에서 import하지 않으므로 문서의 존재 여부가 빌드 결과를 바꾸지 않습니다.

## 스타일 재사용

Tailwind CSS 4와 일반 CSS를 유지합니다. [공식 호환성 문서](https://tailwindcss.com/docs/compatibility#sass-less-and-stylus)는 Sass와의 결합 대신 CSS 변수와 네이티브 중첩을 권장합니다. 현재 규모에서는 별도 Sass 의존성과 빌드 단계를 추가할 이점이 작습니다.

공통 색상·서체는 `src/index.css`의 `@theme`에서 관리하고, 시뮬레이터 CSS에서도 `var(--color-ink)`처럼 같은 변수를 참조합니다. 비교 화면과 개념 카드의 동일한 그리드 규칙은 함께 선언합니다. 저울·동전의 상태별 전용 스타일은 `simulator.css`, 일반적인 간격·반응형 배치는 Tailwind 유틸리티로 관리합니다.

## 새 시뮬레이터 추가

1. `src/simulators/<slug>/`에 페이지 진입점과 필요한 `engine/`, `state/`, `components/`를 만듭니다.
2. `src/content/units.ts`의 해당 단원에 고유한 slug와 상태·제목·요약을 추가합니다.
3. `src/router.tsx`에 `units/<unitId>/<slug>` 경로와 페이지를 명시적으로 연결합니다.
4. 공용 `Breadcrumb`, 단원 색 `--unit`, [용어·접근성 기준](ui-guidelines.md)을 적용합니다.
5. 엔진의 입력·종료 조건과 사용자 동작을 검증하고 홈·단원 링크·직접 진입을 확인합니다.
6. 시뮬레이터의 이론과 구현 문서를 `docs/theory/`에 추가하고 [문서 목록](README.md)을 갱신합니다.
