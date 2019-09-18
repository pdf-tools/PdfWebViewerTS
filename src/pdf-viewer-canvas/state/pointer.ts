import { ActionsType } from './appState'
import { CanvasPixels } from './canvas'

/** @internal */
export type PointerAction = 'click' | 'dblclick' | 'longpress' | 'startdrag' | 'enddrag' | null
export type PointerType = 'mouse' | 'touch'

/** @internal */
export interface PointerState {
  positionChanged: boolean
  stateChanged: boolean
  isDown: boolean
  type: PointerType
  action: PointerAction
  x: CanvasPixels
  y: CanvasPixels
}

/** @internal */
export const state: PointerState = {
  positionChanged: true,
  stateChanged: true,
  isDown: false,
  type: 'ontouchstart' in window ? 'touch' : 'mouse',
  action: null,
  x: { devicePixels: 0, cssPixels: 0 },
  y: { devicePixels: 0, cssPixels: 0 },
}

/** @internal */
export interface UpdatePointerPayload {
  cssX: number
  cssY: number
  isDown: boolean
  type: PointerType
}

/** @internal */
export interface PointerActions {
  update(payload: UpdatePointerPayload): PointerState
  setAction(action: PointerAction): PointerState
}

/** @internal */
export const actions: ActionsType<PointerState, PointerActions> = {
  setAction: (action: PointerAction) => $state => ({
    ...$state,
    action,
  }),
  update: (payload: UpdatePointerPayload) => $state => {
    const pixelRatio = window.devicePixelRatio
    const newState = { ...$state }
    newState.type = payload.type
    if ($state.x.cssPixels !== payload.cssY || $state.x.cssPixels !== payload.cssX) {
      newState.x.cssPixels = payload.cssX
      newState.x.devicePixels = payload.cssX * pixelRatio
      newState.y.cssPixels = payload.cssY
      newState.y.devicePixels = payload.cssY * pixelRatio
      newState.positionChanged = true
    }
    if ($state.isDown !== payload.isDown) {
      newState.isDown = payload.isDown
      newState.stateChanged = true
    }

    return newState
  },
}
