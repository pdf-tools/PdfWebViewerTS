import { ActionsType } from './appState'
import { CanvasPixels } from './canvas'

/** @internal */
export interface ScrollState {
  topPositionChanged: boolean
  leftPositionChanged: boolean
  top: CanvasPixels
  left: CanvasPixels
}

/** @internal */
export const state: ScrollState = {
  topPositionChanged: false,
  leftPositionChanged: false,
  top: { devicePixels: 0, cssPixels: 0 },
  left: { devicePixels: 0, cssPixels: 0 },
}

/** @internal */
export interface ScrollChangedPayload {
  cssTop: number
  cssLeft: number
}

/** @internal */
export interface ScrollActions {
  scrollChanged(payload: ScrollChangedPayload): ScrollState
}

/** @internal */
export const actions: ActionsType<ScrollState, ScrollActions> = {
  scrollChanged: (payload: ScrollChangedPayload) => $state => {
    const newState = { ...$state }
    const pixelRatio = window.devicePixelRatio
    if ($state.top.devicePixels !== payload.cssTop) {
      newState.top.cssPixels = payload.cssTop / pixelRatio
      newState.top.devicePixels = payload.cssTop
      newState.topPositionChanged = true
    }
    if ($state.left.devicePixels !== payload.cssLeft) {
      newState.left.cssPixels = payload.cssLeft / pixelRatio
      newState.left.devicePixels = payload.cssLeft
      newState.leftPositionChanged = true
    }

    return newState
  },
}
