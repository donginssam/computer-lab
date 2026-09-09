# 동인쌤의 컴퓨터실

중학교 정보 교과의 **컴퓨팅 시스템 · 데이터 · 알고리즘과 프로그래밍 · 인공지능 · 디지털 문화**를 체험하는 학습용 시뮬레이터 PWA입니다. 서버와 로그인 없이 브라우저에서 실행하며, 설치한 뒤에는 인터넷 연결 없이도 사용할 수 있습니다. 교실 PC·크롬북·태블릿과 최소 360px 화면을 대상으로 합니다.

현재 5개 단원 페이지와 알고리즘 단원의 **양팔저울로 가짜 동전 찾기**, **문제 해결 전략 실험실**을 제공합니다. 나머지 단원의 시뮬레이터는 준비 중입니다.

## 빠른 시작

Node.js 24 환경에서 개발하며, 패키지 매니저로 pnpm을 사용합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

터미널에 표시된 개발 서버 주소(기본 `http://localhost:5173`)를 엽니다.

## 기술 구성

React 19 · TypeScript 6 · Vite 8 · React Router 8 · Tailwind CSS 4 · Recharts 3을 사용합니다. `vite-plugin-pwa`와 Workbox가 앱 설치 정보, 오프라인 캐시, 새 버전 알림을 만듭니다. 상태는 React reducer와 순수 함수 엔진으로 분리하고, 검증에는 Vitest·React Testing Library·oxlint·Prettier를 사용합니다. 정확한 의존성 선언은 [package.json](package.json), 설치 버전은 [pnpm-lock.yaml](pnpm-lock.yaml)을 기준으로 합니다.

자주 쓰는 검사와 빌드 명령입니다.

```bash
pnpm check         # oxlint + Prettier 검사
pnpm lint          # oxlint
pnpm test          # 엔진 전수 검사 및 상태/UI 검증
pnpm test:watch    # 테스트 감시 실행
pnpm build         # Prettier·TypeScript 검사 + dist 생성, 이어서 404.html 복사
pnpm verify:pwa    # manifest·서비스 워커·Pages 경로 검사
pnpm preview       # 빌드 결과 로컬 미리 보기
pnpm format:check  # 저장소 전체 Prettier 검사
```

PWA 기능은 프로덕션 빌드에서 활성화됩니다. `pnpm build`와 `pnpm preview`를 실행한 뒤 브라우저의 앱 설치 메뉴와 오프라인 새로고침을 확인할 수 있습니다.

헤더 우측의 **앱 설치** 버튼은 지원 브라우저에서 설치 창을 엽니다. 설치 이벤트를 제공하지 않는 환경에서는 브라우저별 설치 방법을 안내합니다. 설치 완료 이벤트를 받거나 설치된 앱의 독립 창으로 실행하면 버튼을 숨깁니다.

### 새 버전 알림

화면 아래 알림은 **새 버전이 있을 때만** 뜹니다. 설치 직후의 오프라인 준비 완료 같은 상태는 알리지 않습니다 — 설치했으면 당연한 상태라 수업 중 방해만 되기 때문입니다.

새 배포를 받으면 `새 버전이 나왔어요.` 알림이 뜹니다. **수업 중에는 `나중에`** 를 누르면 알림만 닫히고 화면은 그대로 유지됩니다 — 새 워커는 대기 상태로 남아 있다가 앱을 완전히 닫았다 다시 열 때 적용됩니다. **`지금 새로 고침`** 을 누르면 즉시 새 버전으로 다시 불러옵니다.

### 설치 화면 스크린샷

Chrome이 풍부한 설치 UI(앱 미리보기가 있는 설치 대화상자)를 띄우려면 `form_factor`가 `wide`인 스크린샷과 `wide`가 아닌 스크린샷이 각각 최소 1장씩 필요합니다. `public/screenshot-wide.png`(1280×720, 데스크톱)와 `public/screenshot-narrow.png`(540×960, 모바일)가 그 역할을 하며, 둘 다 실행 중인 양팔저울 시뮬레이터를 실제로 캡처한 것입니다.

UI를 크게 바꾸면 같은 크기로 다시 캡처해 교체하세요. `pnpm verify:pwa`가 두 form factor의 존재와 **manifest에 적힌 `sizes`가 실제 PNG 크기와 일치하는지**까지 검사하므로, 크기가 어긋나면 빌드 검증에서 걸립니다.

## 개발 문서

| 문서                                      | 내용                                   |
| ----------------------------------------- | -------------------------------------- |
| [개발 문서 안내](docs/README.md)          | 개발 문서의 구성과 읽는 순서           |
| [개발 환경](docs/development.md)          | 실행 명령, 설정, 작업 절차             |
| [아키텍처](docs/architecture.md)          | 디렉터리, 라우팅, 시뮬레이터 추가 방법 |
| [화면과 용어 규칙](docs/ui-guidelines.md) | 디자인 토큰, 학생용 문구, 접근성       |
| [검증](docs/testing.md)                   | 자동 테스트와 수동 확인 절차           |
| [배포](docs/deployment.md)                | GitHub Pages 설정 및 확인 절차         |
