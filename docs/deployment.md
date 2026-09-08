# GitHub Pages 배포

[문서 목록](README.md) · [개발 환경](development.md)

## 현재 구성

[deploy.yml](../.github/workflows/deploy.yml)은 `main` 푸시와 `workflow_dispatch` 수동 실행을 받습니다. 작업 순서는 checkout → pnpm 설정 → Node.js 24와 pnpm 캐시 → lockfile 고정 설치 → test → build → Pages 구성 → `dist` 업로드 → 배포입니다.

권한은 `contents: read`, `pages: write`, `id-token: write`이며 배포 환경은 `github-pages`입니다. `github-pages` 동시 실행 그룹은 이전 실행을 취소합니다. 실제 Actions 버전과 설정은 워크플로 파일을 기준으로 합니다.

## 공개 경로

| 배포 형태                                            | 빌드 `BASE_PATH` |
| ---------------------------------------------------- | ---------------- |
| 프로젝트 사이트 `https://<owner>.github.io/<repo>/`  | `/<repo>/`       |
| 사용자/조직 루트 사이트 `https://<owner>.github.io/` | `/`              |

현재 워크플로는 `BASE_PATH`를 지정하지 않아 Vite 기본값 `/`로 빌드합니다. 프로젝트 사이트에 배포하려면 Build 단계의 환경 변수에 `BASE_PATH: /${{ github.event.repository.name }}/`를 추가해야 합니다. 루트 사이트는 기본값 `/`를 사용합니다. [Vite 정적 배포 문서](https://github.com/vitejs/vite/blob/main/docs/guide/static-deploy.md)

현재 CI에는 lint 단계가 없으므로 로컬에서 `pnpm lint`를 실행하고, CI에서도 검사하려면 워크플로에 단계를 추가합니다.

로컬 프로젝트 경로 확인:

```bash
BASE_PATH=/computer-lab/ pnpm build
BASE_PATH=/computer-lab/ pnpm preview
```

터미널에 표시된 서버의 `/computer-lab/` 경로에서 홈, 단원, 시뮬레이터를 확인합니다. `vite preview`는 로컬 빌드 확인용입니다. [Vite CLI 문서](https://github.com/vitejs/vite/blob/main/docs/guide/cli.md)

## 실제 배포 절차

1. GitHub 원격 저장소를 연결하고 해당 저장소에 코드를 준비합니다.
2. 저장소 Settings → Pages의 배포 소스를 **GitHub Actions**로 지정합니다.
3. `BASE_PATH`가 사이트 종류와 맞는지 확인합니다.
4. `main`에 푸시하거나 배포 워크플로를 수동 실행합니다.
5. 검사·아티팩트 업로드·배포 단계의 성공과 실제 배포 URL을 확인합니다.
6. 아래 배포 후 확인 항목을 수행하고 결과와 날짜를 이 문서에 기록합니다.

## 깊은 링크와 404

[package.json](../package.json)의 빌드 명령은 `dist/index.html`을 `dist/404.html`로 복사합니다. `public/404.html`을 별도로 유지하지 않습니다. Browser Router의 `basename`은 Vite 공개 경로에서 가져옵니다.

GitHub Pages에서 `/units/algorithm/balance-scale` 같은 깊은 링크에 직접 진입하면 복사된 404 문서가 앱을 렌더링할 수 있지만 **HTTP 응답 코드는 404일 수 있습니다**. 화면 렌더링 성공과 HTTP 200 응답은 별도로 확인합니다. 로컬 preview 성공만으로 호스팅의 fallback 동작을 보증하지 않습니다.

## 배포 후 확인

- [ ] 실제 배포 URL에서 홈·5개 단원·시뮬레이터 진입
- [ ] CSS·JS·지연 로딩 그래프 자산의 하위 경로 정상 로딩
- [ ] 시뮬레이터 깊은 링크 직접 진입과 새로고침, 응답 코드 기록
- [ ] 공유 쿼리 `?mode=compare&n=16` 복원
- [ ] 기록 저장과 새로고침 후 유지
- [ ] 360px 화면과 브라우저 콘솔 확인

2026-09-08 문서 정리 시 `git remote -v` 출력은 비어 있었습니다. 실제 Pages 배포와 URL 검증은 수행하지 않았습니다.
