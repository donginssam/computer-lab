import { Link } from "react-router"

export function NotFoundPage() {
  return (
    <section className="pt-24 pb-16">
      <p className="font-display text-[5rem] leading-none text-ink-3">404</p>
      <h1 className="mt-2 text-[2rem]">이 자리에는 아직 아무것도 없어요</h1>
      <p className="mt-3 max-w-[46ch] text-ink-2">
        주소가 바뀌었거나 잘못 입력된 것 같습니다. 홈으로 돌아가 단원을 다시 골라 주세요.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-ink px-4 py-2 font-medium text-paper hover:bg-ink-2"
      >
        홈으로 가기
      </Link>
    </section>
  )
}
