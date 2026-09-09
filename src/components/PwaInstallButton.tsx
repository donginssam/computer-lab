import { useEffect, useRef, useState } from "react"

interface InstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallButton() {
  const prompt = useRef<InstallPromptEvent | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
  )

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)")
    const capture = (event: Event) => {
      event.preventDefault()
      prompt.current = event as InstallPromptEvent
    }
    const complete = () => {
      prompt.current = null
      dialog.current?.close()
      setInstalled(true)
    }
    const modeChanged = (event: MediaQueryListEvent) => {
      if (event.matches) complete()
    }
    window.addEventListener("beforeinstallprompt", capture)
    window.addEventListener("appinstalled", complete)
    displayMode.addEventListener("change", modeChanged)
    return () => {
      window.removeEventListener("beforeinstallprompt", capture)
      window.removeEventListener("appinstalled", complete)
      displayMode.removeEventListener("change", modeChanged)
    }
  }, [])

  async function install() {
    const event = prompt.current
    if (!event) {
      dialog.current?.showModal()
      return
    }
    prompt.current = null
    setBusy(true)
    try {
      await event.prompt()
    } catch {
      dialog.current?.showModal()
    } finally {
      setBusy(false)
    }
  }

  if (installed) return null

  return (
    <>
      <button className="pwa-install" type="button" disabled={busy} onClick={() => void install()}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
        </svg>
        {busy ? "설치 중…" : "앱 설치"}
      </button>
      <dialog ref={dialog} className="pwa-install-help" aria-labelledby="pwa-install-title">
        <h2 id="pwa-install-title">앱으로 설치하기</h2>
        <p>설치하면 홈 화면에서 바로 열고, 인터넷 없이도 실험할 수 있어요.</p>
        <ul>
          <li>
            <strong>Chrome · Edge:</strong> 주소창의 설치 아이콘을 찾아 주세요.
          </li>
          <li>
            <strong>iPhone · iPad:</strong> Safari의 공유 메뉴에서 ‘홈 화면에 추가’를 선택하세요.
          </li>
          <li>
            <strong>Mac Safari:</strong> 파일 메뉴에서 ‘Dock에 추가’를 선택하세요.
          </li>
        </ul>
        <p className="pwa-install-note">
          설치 메뉴가 없다면 일반 창에서 Chrome이나 Safari로 열어 보세요. 처음 설치할 때는 인터넷에
          연결해 앱을 충분히 불러온 뒤 사용해 주세요.
        </p>
        <form method="dialog">
          <button type="submit">닫기</button>
        </form>
      </dialog>
    </>
  )
}
