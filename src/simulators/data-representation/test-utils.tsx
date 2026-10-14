import { renderWithRouter } from "../../test/renderWithRouter"
import { DataRepresentationPage } from "."

export function renderDataRepresentation(query = "") {
  return renderWithRouter(
    <DataRepresentationPage />,
    `/units/data/data-representation${query ? `?${query}` : ""}`,
  )
}
