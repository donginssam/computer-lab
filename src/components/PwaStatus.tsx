import { useRegisterSW } from "virtual:pwa-register/react"

export function PwaStatus() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <aside className="pwa-status" role="status" aria-live="polite" aria-atomic="true">
      <p>
        {needRefresh
          ? "새 버전이 준비되었습니다. 업데이트하면 최신 내용으로 다시 열립니다."
          : "앱 준비가 끝났습니다. 인터넷이 없어도 사용할 수 있습니다."}
      </p>
      <div className="pwa-status__actions">
        {needRefresh && (
          <button type="button" onClick={() => void updateServiceWorker(true)}>
            업데이트
          </button>
        )}
        <button type="button" onClick={close}>
          닫기
        </button>
      </div>
    </aside>
  )
}
