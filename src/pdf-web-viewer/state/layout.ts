import { ActionsType } from 'hyperapp'

/** @internal */
export interface LayoutState {
  breakPoint: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

/** @internal */
export const state: LayoutState = {
  breakPoint: '',
  deviceType: 'desktop',
}

/** @internal */
export interface LayoutActions {
  setBreakPoint(breakPoint: string): LayoutState
  setDeviceType(deviceType: string): LayoutState
}

/** @internal */
export const actions: ActionsType<LayoutState, LayoutActions> = {
  setBreakPoint: (breakPoint: string) => $state => ({
    ...$state,
    breakPoint,
  }),
  setDeviceType: (deviceType: string) => $state => ({
    ...$state,
    deviceType,
  }),
}
