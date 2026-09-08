# 동인쌤의 컴퓨터실

중학교 정보 교과의 **컴퓨팅 시스템 · 데이터 · 알고리즘과 프로그래밍 · 인공지능 · 디지털 문화**를 체험하는 학습용 시뮬레이터 사이트입니다. 서버와 로그인 없이 브라우저에서 실행하며, 교실 PC·크롬북·태블릿과 최소 360px 화면을 대상으로 합니다.

현재 5개 단원 페이지와 첫 시뮬레이터 **양팔저울로 가짜 동전 찾기**를 제공합니다. 나머지 단원의 시뮬레이터는 준비 중입니다.

## 빠른 시작

Node.js 24 환경에서 개발하며, 패키지 매니저로 pnpm을 사용합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

터미널에 표시된 개발 서버 주소(기본 `http://localhost:5173`)를 엽니다.

## 기술 구성

React 19 · TypeScript 6 · Vite 8 · React Router 8 · Tailwind CSS 4 · Recharts 3을 사용합니다. 상태는 React reducer와 순수 함수 엔진으로 분리하고, 검증에는 Vitest·React Testing Library·oxlint·Prettier를 사용합니다. 정확한 의존성 선언은 [package.json](package.json), 설치 버전은 [pnpm-lock.yaml](pnpm-lock.yaml)을 기준으로 합니다.

자주 쓰는 검사와 빌드 명령입니다.

```bash
pnpm lint          # oxlint
pnpm test          # 엔진 전수 검사 및 상태/UI 검증
pnpm test:watch    # 테스트 감시 실행
pnpm build         # TypeScript 검사 + dist 생성 + 404.html 복사
pnpm preview       # 빌드 결과 로컬 미리 보기
pnpm format:check  # 저장소 전체 Prettier 검사
```

## 개발 문서

| 문서                                      | 내용                                   |
| ----------------------------------------- | -------------------------------------- |
| [개발 문서 안내](docs/README.md)          | 개발 문서의 구성과 읽는 순서           |
| [개발 환경](docs/development.md)          | 실행 명령, 설정, 작업 절차             |
| [아키텍처](docs/architecture.md)          | 디렉터리, 라우팅, 시뮬레이터 추가 방법 |
| [화면과 용어 규칙](docs/ui-guidelines.md) | 디자인 토큰, 학생용 문구, 접근성       |
| [검증](docs/testing.md)                   | 자동 테스트와 수동 확인 절차           |
| [배포](docs/deployment.md)                | GitHub Pages 설정 및 확인 절차         |
