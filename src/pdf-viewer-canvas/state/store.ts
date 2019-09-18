import { ActionsType, appState } from './appState'
import * as Document from './document'
import * as Annotations from './annotations'
import * as Canvas from './canvas'
import * as Scroll from './scroll'
import * as Pointer from './pointer'
import * as Search from './search'
import * as Viewer from './viewer'

/** @internal */
export interface ViewerCanvasState {
  document: Document.DocumentState
  annotations: Annotations.AnnotationsState
  canvas: Canvas.CanvasState
  scroll: Scroll.ScrollState
  pointer: Pointer.PointerState
  startPointer: Pointer.PointerState
  search: Search.SearchState
  viewer: Viewer.ViewerState
}

/** @internal */
export interface ViewerCanvasStore {
  document: Document.DocumentActions
  annotations: Annotations.AnnotationsActions
  canvas: Canvas.CanvasActions
  scroll: Scroll.ScrollActions
  pointer: Pointer.PointerActions
  startPointer: Pointer.PointerActions
  search: Search.SearchActions
  viewer: Viewer.ViewerActions
  getState(): ViewerCanvasState
  loadDefaultState(): ViewerCanvasState
  resetChangedState(): ViewerCanvasState
}

/** @internal */
export const defaultState: ViewerCanvasState = {
  document: Document.state,
  annotations: Annotations.state,
  canvas: Canvas.state,
  scroll: Scroll.state,
  pointer: Pointer.state,
  startPointer: Pointer.state,
  search: Search.state,
  viewer: Viewer.state,
}

/** @internal */
const deepClone = <T>(state: T) => {
  return JSON.parse(JSON.stringify(state)) as T
}

/** @internal */
export const actions: ActionsType<ViewerCanvasState, ViewerCanvasStore> = {
  document: Document.actions,
  annotations: Annotations.actions,
  canvas: Canvas.actions,
  scroll: Scroll.actions,
  search: Search.actions,
  pointer: Pointer.actions,
  startPointer: Pointer.actions,
  viewer: Viewer.actions,
  getState: () => $state => ($state),
  loadDefaultState: () => $state => {
    return deepClone(defaultState)
  },
  resetChangedState: () => $state => ({
    ...$state,
    changed: false,
    viewer: {
      ...$state.viewer,
      modeChanged: false,
      cursorStyleChanged: false,
      selectedAnnotationChanged: false,
      textSelectionChanged: false,
      selectedPopupChanged: false,
      command: null,
    },
    annotations: {
      ...$state.annotations,
      annotationsChanged: false,
      openPopupChanged: false,
    },
    document: {
      ...$state.document,
      busyStateChanged: false,
      heightChanged: false,
      widthChanged: false,
      firstVisiblePageChanged: false,
      lastVisiblePageChanged: false,
      rotationChanged: false,
      zoomChanged: false,
    },
    canvas: {
      ...$state.canvas,
      canvasInvalidated: false,
      heightChanged: false,
      widthChanged: false,
    },
    scroll: {
      ...$state.scroll,
      leftPositionChanged: false,
      topPositionChanged: false,
    },
    pointer: {
      ...$state.pointer,
      positionChanged: false,
      stateChanged: false,
      action: null,
    },
  }),
}

/** @internal */
export const createStore = () => {
  return appState<ViewerCanvasState, ViewerCanvasStore>(deepClone(defaultState), actions)
}
