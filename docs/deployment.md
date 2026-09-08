# GitHub Pages 배포

[문서 목록](README.md) · [개발 환경](development.md)

## 현재 구성

[deploy.yml](../.github/workflows/deploy.yml)은 `main` 푸시와 `workflow_dispatch` 수동 실행을 받습니다. 작업 순서는 checkout → pnpm 설정 → Node.js 24와 pnpm 캐시 → lockfile 고정 설치 → test → lint → Pages 구성 → build → PWA 검사 → `dist` 업로드 → 배포입니다.

권한은 `contents: read`, `pages: write`, `id-token: write`이며 배포 환경은 `github-pages`입니다. `github-pages` 동시 실행 그룹은 이전 실행을 취소합니다. 실제 Actions 버전과 설정은 워크플로 파일을 기준으로 합니다.

## 공개 경로

| 배포 형태                                            | Vite `--base` 인자 |
| ---------------------------------------------------- | ------------------ |
| 프로젝트 사이트 `https://<owner>.github.io/<repo>/`  | `/<repo>/`         |
| 사용자/조직 루트 사이트 `https://<owner>.github.io/` | `/`                |

워크플로는 Pages 구성 단계의 `base_path` 출력에 마지막 `/`를 붙여 `vite build --base=...` 인자로 직접 전달합니다. 별도의 환경 변수 없이 프로젝트 사이트는 `/<repo>/`, 루트 사이트와 사용자 지정 도메인은 `/`로 자동 설정됩니다. [GitHub Pages 액션 출력](https://github.com/actions/configure-pages/blob/main/action.yml) · [Vite 정적 배포 문서](https://github.com/vitejs/vite/blob/main/docs/guide/static-deploy.md)

로컬 프로젝트 경로 확인:

```bash
pnpm build --base=/computer-lab/
pnpm verify:pwa
pnpm preview --base=/computer-lab/
```

터미널에 표시된 서버의 `/computer-lab/` 경로에서 홈, 단원, 시뮬레이터를 확인합니다. `vite preview`는 로컬 빌드 확인용입니다. PWA 설치와 서비스 워커는 HTTPS 또는 localhost 같은 보안 컨텍스트에서 동작합니다. [Vite CLI 문서](https://github.com/vitejs/vite/blob/main/docs/guide/cli.md)

## PWA 경로와 업데이트

manifest의 `start_url`·`scope`, 서비스 워커 URL과 범위는 Vite의 `--base` 값을 따릅니다. 따라서 프로젝트 사이트 `/computer-lab/`에 설치한 앱과 캐시는 그 경로 안에서만 동작합니다. 워크플로의 `pnpm verify:pwa`가 이 경로 일치를 배포 전에 확인합니다.

앱 셸과 정적 자산은 처음 접속할 때 캐시에 저장됩니다. 새 배포를 감지하면 바로 화면을 바꾸지 않고 업데이트 알림을 띄우며, 사용자가 **업데이트**를 누르면 새 서비스 워커를 적용하고 다시 엽니다. 수업 도중 진행 상태가 갑자기 사라지는 일을 줄이기 위한 방식입니다.

## 실제 배포 절차

1. GitHub 원격 저장소를 연결하고 해당 저장소에 코드를 준비합니다.
2. 저장소 Settings → Pages의 배포 소스를 **GitHub Actions**로 지정합니다.
3. Pages 구성 단계가 반환한 공개 경로가 Build 단계의 `--base` 인자로 전달되는지 확인합니다.
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
- [ ] 브라우저 설치 메뉴에서 앱 설치, standalone 실행
- [ ] 설치 후 오프라인에서 홈·단원·시뮬레이터 새로고침
- [ ] 새 버전 배포 후 업데이트 알림과 **업데이트** 동작
- [ ] manifest와 서비스 워커가 배포 하위 경로에서 200 응답
- [ ] 360px 화면과 브라우저 콘솔 확인

2026-09-08 문서 정리 시 `git remote -v` 출력은 비어 있었습니다. 실제 Pages 배포와 URL 검증은 수행하지 않았습니다.
