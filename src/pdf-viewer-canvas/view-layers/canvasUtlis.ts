import { Point, Rect } from '../../pdf-viewer-api'

/** @internal */
export const pointInRect = (p: Point, rect: Rect, padding?: number) => {
  if (padding) {
    rect.x -= padding
    rect.y -= padding
    rect.w += 2 * padding
    rect.h += 2 * padding
  }
  return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h
}
