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

| 명령                | 실제 스크립트 / 용도                                              |
| ------------------- | ----------------------------------------------------------------- |
| `pnpm dev`          | `vite`: 개발 서버                                                 |
| `pnpm build`        | Prettier·TypeScript 검사·Vite 빌드 후 `postbuild`로 404.html 복사 |
| `pnpm verify:pwa`   | manifest·서비스 워커·공개 경로·404 fallback 검사                  |
| `pnpm preview`      | `vite preview`: 빌드된 정적 파일 미리 보기                        |
| `pnpm typecheck`    | `tsc --noEmit`: 앱·테스트·Vite 설정의 strict 타입 검사            |
| `pnpm test`         | `vitest run`: 전체 테스트 1회                                     |
| `pnpm test:watch`   | `vitest`: 감시 모드                                               |
| `pnpm lint`         | `oxlint`: 정적 검사                                               |
| `pnpm format`       | `prettier --write .`: 저장소 전체 포맷 적용                       |
| `pnpm format:check` | `prettier --check .`: 저장소 전체 포맷 검사                       |

문서만 수정했다면 `pnpm exec prettier --check README.md docs`로 범위를 좁힐 수 있습니다. 일부 파일만 고칠 때는 `pnpm exec prettier --write <파일 경로>`를 사용해 다른 작업의 변경을 줄입니다.

`pnpm build`는 포맷이 맞지 않으면 빌드 전에 실패합니다. `pnpm format`으로 수정한 뒤 다시 실행합니다. `dist/`, `node_modules/`, lockfile과 로컬 실행 설정 `.claude/launch.json`은 포맷 검사에서 제외합니다.

## 주요 설정

| 파일                                                            | 책임                                               |
| --------------------------------------------------------------- | -------------------------------------------------- |
| [vite.config.ts](../vite.config.ts)                             | React·Tailwind·PWA, Vitest jsdom 및 setup          |
| [tsconfig.json](../tsconfig.json)                               | 앱·테스트·Vite 설정의 공통 TypeScript 설정         |
| [.prettierrc](../.prettierrc)                                   | 세미콜론 없음, 한 인자 화살표 괄호 생략, 줄 폭 100 |
| [src/test/setup.ts](../src/test/setup.ts)                       | 테스트 공통 초기화                                 |
| [.github/workflows/pr.yml](../.github/workflows/pr.yml)         | PR의 정적 검사(lint·포맷)                          |
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | 테스트·빌드·PWA 검사와 Pages 배포                  |

TypeScript 설정은 하나로 관리합니다. 별도 Node 실행 프로그램 없이 Vite가 설정 파일도 번들링하므로 앱과 설정에 `moduleResolution: bundler`를 적용합니다. DOM·Node 타입을 함께 포함하며 `strict` 검사를 켭니다. 독립적인 서버 프로그램이 생기면 실행 환경별 설정 분리를 검토합니다.

공개 경로는 환경 변수 없이 Vite의 `--base` 빌드 인자로 지정합니다. 인자를 생략하면 `/`이며 프로젝트 사이트는 `/computer-lab/`처럼 지정합니다. Vite는 이 값으로 자산 URL과 `import.meta.env.BASE_URL`을 함께 맞춥니다. [Vite 빌드 문서](https://github.com/vitejs/vite/blob/main/docs/guide/build.md)

```bash
pnpm build --base=/computer-lab/
pnpm verify:pwa
pnpm preview --base=/computer-lab/
```

`verify:pwa`는 빌드가 끝난 `dist/`에서 manifest의 시작 경로와 서비스 워커 등록 경로가 같은지 확인합니다. `preview`는 먼저 만들어 둔 `dist/`를 확인하는 용도입니다. [Vite CLI 문서](https://github.com/vitejs/vite/blob/main/docs/guide/cli.md)

## 작업 순서

1. [AGENTS.md](../AGENTS.md)와 변경 영역의 문서를 확인합니다. 라이브러리/API 문서나 설정이 필요하면 지침에 따라 Context7을 사용합니다.
2. 엔진 로직은 `engine/`, 실행 제어는 `state/`, 화면은 `components/`에서 수정합니다.
3. 행동이 달라지는 변경에는 그 행동을 확인하는 테스트를 수정하고 [검증 절차](testing.md)를 실행합니다.
4. README와 관련 개발·이론 문서를 현재 코드와 맞춥니다.

새 시뮬레이터 추가 절차는 [아키텍처](architecture.md)에 있습니다.
