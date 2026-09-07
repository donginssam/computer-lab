# 동인쌤의 컴퓨터실

중학교 정보 교과 5개 단원의 학습용 시뮬레이터 사이트입니다. 서버와 로그인 없이 브라우저에서 실행합니다. 현재 **양팔저울로 알고리즘 비교하기**를 사용할 수 있습니다.

## 개발과 검증

Node.js LTS와 Corepack/pnpm 11.22.0을 사용합니다.

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm lint         # oxlint
pnpm test         # Vitest: 엔진 전수 검사 + 상태/UI 검증
pnpm build        # 타입 검사 + dist/ + 404.html
pnpm preview      # 빌드 결과 미리 보기
pnpm format:check # Prettier
```

## 양팔저울 사용법

`/units/algorithm/balance-scale`에서 시작합니다.

- **시뮬레이션**: 상자 2~100개, 순차/절반 나누기, 최악/무작위 위치를 선택합니다. 숫자는 Enter 또는 초점을 옮기면 확정됩니다. 다음 단계·이전·초기화·자동 실행·속도 조절을 지원합니다.
- **나란히 비교**: 동일한 상자 수와 불량 위치에서 두 알고리즘을 진행합니다. 먼저 완료된 알고리즘은 멈춥니다. 최악 위치는 선택한 기준 알고리즘에 적용되며 두 알고리즘에서 동시에 최악임을 뜻하지 않습니다.
- **직접 해보기**: 보낼 접시를 선택하고 상자를 클릭합니다. 양쪽에 같은 수를 올려 저울질한 뒤 정답을 제출합니다. 새 문제, 비교 기록, 3단계 힌트를 제공합니다.
- **실험 기록**: 완료한 자동/단계별 시뮬레이션을 표와 그래프로 비교합니다. 최근 500개를 이 브라우저의 `localStorage`에 저장하며 행별/전체 삭제가 가능합니다. 저장이 차단되면 현재 페이지에서만 유지합니다. 직접 해보기는 알고리즘 실험 기록에 포함하지 않습니다.

본문에서 `Space`는 다음 단계, `R`은 초기화, `A`는 자동 실행/정지입니다. 입력·버튼에 초점이 있을 때는 단축키가 개입하지 않습니다. 모드 탭은 방향키와 Home/End로 이동합니다. 탭이나 설정을 바꾸면 실행 중 타이머를 정리하고 새 실험으로 시작합니다.

공유 예: `/units/algorithm/balance-scale?mode=compare&n=16&algorithm=divide-half&placement=worst`

지원 모드는 `simulation`, `compare`, `try`, `records`입니다. URL은 설정을 공유하며 무작위 정답 위치·진행 단계·실험 기록을 공유하지 않습니다.

## 수업에서 설명할 점

순차 비교의 정확한 최악 횟수는 `⌊N/2⌋`, 구현된 절반 나누기는 `⌊log₂N⌋`입니다. 홀수에서 한 상자를 저울 밖에 두므로 N=7은 7 → 3 → 1, 총 2회입니다. 원래 계획의 `⌈log₂N⌉`은 느슨한 상한으로 그래프에 따로 표시합니다.

직접 해보기의 최적 보장 횟수 `⌈log₃N⌉`은 저울의 세 결과를 모두 활용하는 전략 기준입니다. 개별 실험에서는 운 좋게 그보다 적게 비교할 수 있습니다. 화면 하단에 개념 카드, 정리 질문 3개, 접이식 교사용 수업 흐름이 있습니다.

## 구조

- `src/content/units.ts`: 단원 및 시뮬레이터 메타데이터
- `src/simulators/balance-scale/engine`: UI와 분리된 불변 알고리즘·저울 판정·이론값
- `src/simulators/balance-scale/state`: reducer, 자동 실행 훅, 실험 기록 저장 형식
- `src/simulators/balance-scale/components`: 저울, 비교, 기록, 그래프, 직접 해보기, 개념 설명

저울은 CSS transition을 사용하며 모션 감소 환경에서 애니메이션을 끕니다. Recharts는 기록 탭에서만 불러옵니다. 새 시뮬레이터는 메타데이터와 페이지 구현, `src/router.tsx`의 라우트를 함께 추가합니다.

## GitHub Pages 배포

원격 저장소를 연결한 뒤 Pages 소스를 **GitHub Actions**로 지정합니다. `main` 푸시 또는 수동 실행 시 `.github/workflows/deploy.yml`이 lint/test/build 후 배포합니다. pnpm 버전은 `package.json`에 고정되어 있습니다.

프로젝트 경로의 로컬 빌드 확인:

```bash
BASE_PATH=/computer-lab/ pnpm build
pnpm preview
```

빌드는 `dist/index.html`을 `dist/404.html`로 복사합니다. GitHub Pages에서 깊은 링크를 새로고침하면 fallback이 앱을 렌더링하지만 HTTP 상태는 404일 수 있습니다. 사용자/조직 루트 사이트(`owner.github.io`)라면 워크플로의 `BASE_PATH`를 `/`로 바꾸세요.

**검증 상태**: 17개 테스트·lint·타입 검사·빌드 통과. 360/768/1280px 화면, N=7/8/100 브라우저 실행, 기록 새로고침 유지 확인. 정량 FPS 측정과 실제 GitHub Pages URL 검증은 미실시입니다. 현재 원격 저장소 URL이 설정되지 않아 배포는 실행하지 않았습니다.

세부 계획과 완료 체크리스트는 [walkthrough.md](./walkthrough.md)에 있습니다.
