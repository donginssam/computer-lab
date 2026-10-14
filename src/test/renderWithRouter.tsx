import type { ReactNode } from "react"
import { render } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"

// 테스트 전용 헬퍼는 Fast Refresh 대상이 아니므로 관찰 컴포넌트를 함께 둔다.
// eslint-disable-next-line react/only-export-components
function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

/** 실제 URL 갱신을 확인하면서 페이지를 렌더링한다. */
export function renderWithRouter(ui: ReactNode, url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      {ui}
      <LocationProbe />
    </MemoryRouter>,
  )
}
