# GitHub Pages 배포

[문서 목록](README.md) · [개발 환경](development.md)

## 현재 구성

검사는 [ci.yml](../.github/workflows/ci.yml)이 `pnpm check` → `pnpm test` → 기본 경로 `pnpm build`와 `pnpm verify:pwa` → 프로젝트 하위 경로 빌드와 `pnpm verify:pwa` 순으로 실행합니다. 하위 경로는 `GITHUB_REPOSITORY`에서 저장소 이름을 떼어내 `--base`로 넘기므로 배포와 같은 모양이 됩니다. `main`이 아닌 브랜치의 푸시, 포크에서 온 pull request, 그리고 배포 워크플로의 호출(`workflow_call`)에서 실행됩니다. 같은 저장소 브랜치는 푸시로 이미 검사하고 `main` 푸시는 배포가 호출하므로, 어떤 커밋도 두 번 검사하지 않습니다.

[deploy.yml](../.github/workflows/deploy.yml)은 `main` 푸시와 `workflow_dispatch` 수동 실행을 받고, 두 개의 job으로 구성합니다. `ci` job이 위 워크플로를 그대로 호출하고, `deploy` job이 `needs: ci`로 그 뒤에 붙습니다. 따라서 CI가 실패하거나 취소되면 배포 job은 시작하지 않으며, 검사와 배포가 같은 커밋 위에서 순서대로 일어납니다. `deploy` job의 순서는 checkout → pnpm 설정 → Node.js 24와 pnpm 캐시 → lockfile 고정 설치 → Pages 구성 → build → `dist` 업로드 → 배포입니다.

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

최초 접속과 설치에는 온라인 연결이 필요합니다. 온라인에서 앱을 열어 서비스 워커의 사전 캐시 다운로드가 완료된 뒤 오프라인으로 전환해야 합니다. 설치 아이콘이 생긴 사실만으로 다운로드 완료를 판단하지 말고, 수업 전에 설치한 앱을 닫고 네트워크를 끈 상태로 다시 열어 확인합니다. 브라우저의 사이트 데이터나 캐시를 삭제하면 온라인에서 다시 준비해야 합니다.

홈·단원과 지연 로딩하는 시뮬레이터·그래프 청크는 모두 사전 캐시를 사용하고 실험 기록은 localStorage에 저장합니다. Google Fonts는 접속 중 받은 파일을 별도로 캐시하며, 캐시되지 않은 서체는 오프라인에서 시스템 서체로 대체합니다. 설치 대화상자용 스크린샷은 오프라인 실행에 필요하지 않아 사전 캐시에서 제외합니다.

manifest의 `start_url`·`scope`, 서비스 워커 URL과 범위는 Vite의 `--base` 값을 따릅니다. 따라서 프로젝트 사이트 `/computer-lab/`에 설치한 앱과 캐시는 그 경로 안에서만 동작합니다. CI가 루트와 하위 경로 두 빌드에 `pnpm verify:pwa`를 돌려 이 경로 일치를 확인합니다. 로컬에서 같은 검사를 하려면 아래를 실행합니다.

```bash
pnpm build --base="/computer-lab/" && pnpm verify:pwa
```

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

GitHub Pages에서 `/units/algorithm/balance-scale`이나 `/units/algorithm/problem-solving` 같은 깊은 링크에 직접 진입하면 복사된 404 문서가 앱을 렌더링할 수 있지만 **HTTP 응답 코드는 404일 수 있습니다**. 화면 렌더링 성공과 HTTP 200 응답은 별도로 확인합니다. 로컬 preview 성공만으로 호스팅의 fallback 동작을 보증하지 않습니다.

## 배포 후 확인

- [ ] 실제 배포 URL에서 홈·5개 단원·시뮬레이터 진입
- [ ] CSS·JS·지연 로딩 시뮬레이터·그래프 자산의 하위 경로 정상 로딩
- [ ] 시뮬레이터 깊은 링크 직접 진입과 새로고침, 응답 코드 기록
- [ ] 공유 쿼리 `?mode=compare&n=16`, `?strategy=lock&d=4&speed=1000` 복원
- [ ] 기록 저장과 새로고침 후 유지
- [ ] 브라우저 설치 메뉴에서 앱 설치, standalone 실행
- [ ] 설치 후 오프라인에서 홈·단원·시뮬레이터 새로고침
- [ ] 새 버전 배포 후 업데이트 알림과 **업데이트** 동작
- [ ] manifest와 서비스 워커가 배포 하위 경로에서 200 응답
- [ ] 360px 화면과 브라우저 콘솔 확인

2026-09-08 문서 정리 시 `git remote -v` 출력은 비어 있었습니다. 실제 Pages 배포와 URL 검증은 수행하지 않았습니다.
