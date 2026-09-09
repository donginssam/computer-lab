import { useRegisterSW } from "virtual:pwa-register/react"

/**
 * Only speaks up when a new version is waiting. Offline readiness needs no
 * announcement — it is the expected state once the app is installed.
 *
 * immediate: false는 workbox가 window load 뒤에 등록하게 한다. 첫 방문에서
 * 서비스 워커가 내려받는 precache가 첫 화면 렌더와 대역폭을 다투지 않는다.
 * 이미 설치된 워커가 제어하는 재방문·오프라인에는 영향이 없다.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: false })

  if (!needRefresh) return null

  // The new worker only waits, so dismissing keeps the current version running
  // for the rest of the lesson and the update lands on the next cold start.
  return (
    <aside className="pwa-update" role="status" aria-live="polite" aria-atomic="true">
      <p>
        <strong>새 버전이 나왔어요.</strong> 수업 중이면 ‘나중에’를 눌러도 됩니다. 앱을 완전히
        닫았다가 다시 열면 새 버전으로 시작합니다.
      </p>
      <div className="pwa-update__actions">
        <button type="button" onClick={() => setNeedRefresh(false)}>
          나중에
        </button>
        <button type="button" className="primary" onClick={() => void updateServiceWorker(true)}>
          지금 새로 고침
        </button>
      </div>
    </aside>
  )
}
