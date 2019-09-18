import { ActionsType } from './appState'

/** @internal */
export interface CanvasPixels {
  devicePixels: number
  cssPixels: number
}

/** @internal */
export interface CanvasState {
  widthChanged: boolean
  heightChanged: boolean
  pixelRatioChanged: boolean
  canvasInvalidated: boolean
  width: CanvasPixels
  height: CanvasPixels
  pixelRatio: number
}

/** @internal */
export const state: CanvasState = {
  widthChanged: true,
  heightChanged: true,
  pixelRatioChanged: true,
  canvasInvalidated: true,
  width: { devicePixels: 0, cssPixels: 0 },
  height: { devicePixels: 0, cssPixels: 0 },
  pixelRatio: 1,
}

/** @internal */
export interface CanvasResizePayload {
  cssWidth: number
  cssHeight: number
}

/** @internal */
export interface CanvasActions {
  resize(payload: CanvasResizePayload): CanvasState
  setPixelRatio(pixelRatio: number): CanvasState
  setCanvasInvalidated(canvasInvalidated: boolean): CanvasState
}

/** @internal */
export const actions: ActionsType<CanvasState, CanvasActions> = {
  resize: (payload: CanvasResizePayload) => $state => {
    const pixelRatio = window.devicePixelRatio
    const newState = { ...$state }

    if ($state.pixelRatio !== pixelRatio) {
      newState.pixelRatio = pixelRatio
      newState.pixelRatioChanged = true
    }

    if ($state.width.cssPixels !== payload.cssWidth) {
      newState.width.cssPixels = payload.cssWidth
      newState.width.devicePixels = payload.cssWidth * pixelRatio
      newState.widthChanged = true
    }

    if ($state.height.cssPixels !== payload.cssHeight) {
      newState.height.cssPixels = payload.cssHeight
      newState.height.devicePixels = payload.cssHeight * pixelRatio
      newState.heightChanged = true
    }
    return newState
  },
  setPixelRatio: (pixelRatio: number) => $state => {
    const newState = { ...$state }
    if ($state.pixelRatio !== pixelRatio) {
      newState.pixelRatio = pixelRatio
      newState.pixelRatioChanged = true
    }
    return newState
  },
  setCanvasInvalidated: (canvasInvalidated: boolean) => $state => ({
    ...$state,
    canvasInvalidated,
  }),
}
