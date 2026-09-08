# 개발 환경과 작업 절차

[문서 목록](README.md) · [아키텍처](architecture.md) · [검증](testing.md)

## 환경

Node.js 24 환경에서 개발하며, 패키지 매니저로 pnpm을 사용합니다. 프로젝트의 의존성과 실행 명령은 [package.json](../package.json)을 참고합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

개발 서버 주소는 터미널 출력을 따릅니다. 기본 포트는 5173입니다. 환경 변수 없이도 실행할 수 있으며, 서버·로그인·별도의 데이터베이스 설정은 없습니다.

## 명령어

| 명령                | 실제 스크립트 / 용도                                       |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | `vite`: 개발 서버                                          |
| `pnpm build`        | `tsc -b && vite build && cp dist/index.html dist/404.html` |
| `pnpm preview`      | `vite preview`: 빌드된 정적 파일 미리 보기                 |
| `pnpm test`         | `vitest run`: 전체 테스트 1회                              |
| `pnpm test:watch`   | `vitest`: 감시 모드                                        |
| `pnpm lint`         | `oxlint`: 정적 검사                                        |
| `pnpm format`       | `prettier --write .`: 저장소 전체 포맷 적용                |
| `pnpm format:check` | `prettier --check .`: 저장소 전체 포맷 검사                |

문서만 수정했다면 `pnpm exec prettier --check README.md docs`로 범위를 좁힐 수 있습니다. 일부 파일만 고칠 때는 `pnpm exec prettier --write <파일 경로>`를 사용해 다른 작업의 변경을 줄입니다.

## 주요 설정

| 파일                                                            | 책임                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| [vite.config.ts](../vite.config.ts)                             | React·Tailwind 플러그인, `BASE_PATH`, Vitest jsdom 및 setup |
| [tsconfig.app.json](../tsconfig.app.json)                       | 앱 TypeScript 설정                                          |
| [tsconfig.node.json](../tsconfig.node.json)                     | 빌드 설정 파일의 TypeScript 설정                            |
| [.prettierrc](../.prettierrc)                                   | 세미콜론 없음, 한 인자 화살표 괄호 생략, 줄 폭 100          |
| [src/test/setup.ts](../src/test/setup.ts)                       | 테스트 공통 초기화                                          |
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | CI 검사와 Pages 배포                                        |

`BASE_PATH`는 [vite.config.ts](../vite.config.ts)가 읽어 Vite의 `base`로 넘기는 환경 변수입니다. 지정하지 않으면 `/`이며 프로젝트 사이트는 `/computer-lab/`처럼 지정합니다. `base`는 하위 경로에 배포한 자산의 URL을 맞춰 줍니다. [Vite 빌드 문서](https://github.com/vitejs/vite/blob/main/docs/guide/build.md)

```bash
BASE_PATH=/computer-lab/ pnpm build
BASE_PATH=/computer-lab/ pnpm preview
```

`preview`는 먼저 만들어 둔 `dist/`를 확인하는 용도입니다. [Vite CLI 문서](https://github.com/vitejs/vite/blob/main/docs/guide/cli.md)

## 작업 순서

1. [AGENTS.md](../AGENTS.md)와 변경 영역의 문서를 확인합니다. 라이브러리/API 문서나 설정이 필요하면 지침에 따라 Context7을 사용합니다.
2. 엔진 로직은 `engine/`, 실행 제어는 `state/`, 화면은 `components/`에서 수정합니다.
3. 행동이 달라지는 변경에는 그 행동을 확인하는 테스트를 수정하고 [검증 절차](testing.md)를 실행합니다.
4. README와 관련 개발·이론 문서를 현재 코드와 맞춥니다.

새 시뮬레이터 추가 절차는 [아키텍처](architecture.md)에 있습니다.
