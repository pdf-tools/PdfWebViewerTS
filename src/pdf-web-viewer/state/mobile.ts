import { ActionsType } from 'hyperapp'

/** @internal */
export interface MobileState {
  showToolbar: boolean
}

/** @internal */
export const state: MobileState = {
  showToolbar: true,
}

/** @internal */
export interface MobileActions {
  showToolbar(): MobileState
  hideToolbar(): MobileState
  showAnnotationbar(): MobileState
  hideAnnotationbar(): MobileState
}

/** @internal */
export const actions: ActionsType<MobileState, MobileActions> = {
  showToolbar: () => $state => ({
    ...$state,
    showToolbar: true,
  }),
  hideToolbar: () => $state => ({
    ...$state,
    showToolbar: false,
  }),
  showAnnotationbar: () => $state => ({
    ...$state,
    showToolbar: false,
  }),
  hideAnnotationbar: () => $state => ({
    ...$state,
    showToolbar: true,
  }),
}
