import { ActionsType } from './appState'
import { CanvasPixels } from './canvas'
import { Rect, Point } from '../../pdf-viewer-api'

/** @internal */
export interface DocumentState {
  busyStateChanged: boolean
  heightChanged: boolean
  widthChanged: boolean
  zoomChanged: boolean
  rotationChanged: boolean
  busyState: boolean
  firstVisiblePageChanged: boolean
  lastVisiblePageChanged: boolean
  firstVisiblePage: number
  lastVisiblePage: number
  pageRects: { [key: number]: Rect }
  zoom: number
  rotation: number
  width: CanvasPixels
  height: CanvasPixels
}

/** @internal */
export const state: DocumentState = {
  busyStateChanged: true,
  heightChanged: true,
  widthChanged: true,
  zoomChanged: true,
  rotationChanged: true,
  firstVisiblePageChanged: true,
  lastVisiblePageChanged: true,
  busyState: false,
  firstVisiblePage: 0,
  lastVisiblePage: 0,
  pageRects: [],
  zoom: 1,
  rotation: 0,
  width: { devicePixels: 0, cssPixels: 0 },
  height: { devicePixels: 0, cssPixels: 0 },
}

/** @internal */
export interface DocumentResizedPayload {
  zoom: number
  devicePixelsWidth: number
  devicePixelsHeight: number
}

/** @internal */
export interface DocumentActions {
  fistVisiblePageChanged(pageNumber: number): DocumentState
  lastVisiblePageChanged(pageNumber: number): DocumentState
  busyStateChanged(busyState: boolean): DocumentState
  resize(payload: DocumentResizedPayload ): DocumentState
  rotationChanged(rotation: number): DocumentState
  updatePageRects(pageRects: {[key: number]: Rect}): DocumentState
}

/** @internal */
export const actions: ActionsType<DocumentState, DocumentActions> = {
  fistVisiblePageChanged: (pageNumber: number) => $state => ({
    ...$state,
    firstVisiblePage: pageNumber,
    firstVisiblePageChanged: true,
  }),
  lastVisiblePageChanged: (pageNumber: number) => $state => ({
    ...$state,
    lastVisiblePage: pageNumber,
    lastVisiblePageChanged: true,
  }),
  resize: (payload: DocumentResizedPayload) => $state => {
    const newState = { ...$state }
    const pixelRatio = window.devicePixelRatio

    if (newState.width.devicePixels !== payload.devicePixelsWidth) {
      newState.width.cssPixels = payload.devicePixelsWidth / pixelRatio
      newState.width.devicePixels = payload.devicePixelsWidth
      newState.widthChanged = true
    }

    if (newState.height.devicePixels !== payload.devicePixelsHeight) {
      newState.height.cssPixels = payload.devicePixelsHeight / pixelRatio
      newState.height.devicePixels = payload.devicePixelsHeight
      newState.heightChanged = true
    }

    if (newState.zoom !== payload.zoom) {
      newState.zoom = payload.zoom
      newState.zoomChanged = true
    }

    return newState
  },
  rotationChanged: (rotation: number) => $state => ({
    ...$state,
    rotation,
    rotationChanged: true,
  }),
  updatePageRects: (pageRects: {[key: number]: Rect}) => $state => ({
    ...$state,
    pageRects,
  }),
  busyStateChanged: (busyState: boolean) => $state => ({
    ...$state,
    busyState,
    busyStateChanged: true,
  }),
}

/** @internal */
export const getPageOnPoint = ($state: DocumentState, point: Point) => {
  let page = 0
  for (const pNr in $state.pageRects) {
    if ($state.pageRects[pNr]) {
      const pageRect = $state.pageRects[pNr]
      if (point.x >= pageRect.x && point.x <= pageRect.x + pageRect.w && point.y >= pageRect.y  && point.y <= pageRect.y + pageRect.h) {
        page = parseInt(pNr, 10)
        break
      }
    }
  }
  return page
}

/** @internal */
const getSelectionRectFromPage = ($state: DocumentState, startPoint: Point, endPoint: Point, page: number, padding: number = 1) => {
  let rect: Rect | null = null
  const pageRect = $state.pageRects[page]

  const pX1 = pageRect.x + padding
  const pX2 = pageRect.x + (pageRect.w - 2 * padding)
  const pY1 = pageRect.y + padding
  const pY2 = pageRect.y + (pageRect.h - 2 * padding)

  if (startPoint.x >= pX1 && startPoint.x <= pX2 && startPoint.y >= pY1  && startPoint.y <= pY2) {
    endPoint.x = endPoint.x < pX1 ? pX1 : endPoint.x > pX2 ? pX2 : endPoint.x
    endPoint.y = endPoint.y < pY1 ? pY1 : endPoint.y > pY2 ? pY2 : endPoint.y
    rect = {x: 0, y: 0, w: 0, h: 0}
    if (startPoint.x < endPoint.x) {
      rect.x = startPoint.x
      rect.w = endPoint.x - startPoint.x
    } else {
      rect.x = endPoint.x
      rect.w = startPoint.x - endPoint.x
    }
    if (startPoint.y < endPoint.y) {
      rect.y = startPoint.y
      rect.h = endPoint.y - startPoint.y
    } else {
      rect.y = endPoint.y
      rect.h = startPoint.y - endPoint.y
    }
    return rect
  }
  return rect
}

/** @internal */
export const getRectFromSelection = ($state: DocumentState, startPoint: Point, endPoint: Point, page?: number, padding: number = 1) => {
  if (page) {
    return getSelectionRectFromPage($state, startPoint, endPoint, page)
  } else {
    for (const pNr in $state.pageRects) {
      if ($state.pageRects) {
        const rect = getSelectionRectFromPage($state, startPoint, endPoint, parseInt(pNr, 10), padding)
        if (rect) {
          return rect
        }
      }
    }
  }
  return null
}
