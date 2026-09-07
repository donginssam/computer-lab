# 동인쌤의 컴퓨터실

중학교 정보 교과 단원별 시뮬레이터 모음. 구현 계획은 [walkthrough.md](./walkthrough.md)에 있습니다.

## 개발

```bash
pnpm install
pnpm dev        # 개발 서버
pnpm test       # 단위 테스트 (vitest)
pnpm lint       # oxlint
pnpm format     # prettier
pnpm build      # dist/ 생성 (404.html 포함)
```

## 배포

`main`에 푸시하면 GitHub Actions가 GitHub Pages로 배포합니다. 저장소 설정에서 Pages 소스를
**GitHub Actions**로 지정하세요. 빌드 시 `BASE_PATH=/<저장소 이름>/`이 자동으로 적용됩니다.
