import { ActionsType } from './appState'
import { PdfRect, Annotation, PdfItemType } from '../../pdf-viewer-api'
import { AnnotationBehaviors, getAnnotationBehaviors } from '../AnnotationBehaviors'
import { IconDefinition } from '../../common/Icon'

/** @internal */
export enum ViewerMode {
  DEFAULT,
  ANNOTATION_SELECTED,
  TEXT_SELECTED,
  POPUP_SELECTED,
  MODULE_SELECTED,
}

/** @internal */
export enum CursorStyle {
  DEFAULT = 'default',
  TEXT = 'text',
  NONE = 'none',
  POINTER = 'pointer',
  CROSSHAIR = 'crosshair',
  NOT_ALLOWED = 'not-allowed',
  WAIT = 'wait',
  MOVE = 'move',
  GRAB = 'grab',
  GRABBING = 'grabbing',
  COL_RESIZE = 'col-resize',
  ROW_RESIZE = 'row-resize',
  NS_RESIZE = 'ns-resize',
  EW_RESIZE = 'ew-resize',
  NESW_RESIZE = 'nesw-resize',
  NWSE_RESIZE = 'nwse-resize',
}

/** @internal */
export interface ContextBarItem {
  itemTypes: PdfItemType[],
  icon: IconDefinition,
  onCmd(args?: any): void,
}

/** @internal */
export interface ViewerState {
  modeChanged: boolean
  mode: ViewerMode
  selectedAnnotationId: number | null
  selectedAnnotationBehaviors: AnnotationBehaviors | null
  selectedAnnotationChanged: boolean
  textSelectionChanged: boolean
  textSelection: PdfRect[] | null
  selectedPopupId: number | null
  selectedPopupChanged: boolean | null
  selectedModuleName: string | null
  cursorStyle: CursorStyle
  cursorStyleChanged: boolean
  contextBarItems: ContextBarItem[][]
}

/** @internal */
export const state: ViewerState = {
  modeChanged: true,
  mode: ViewerMode.DEFAULT,
  selectedAnnotationId: null,
  selectedAnnotationBehaviors: null,
  selectedAnnotationChanged: true,
  textSelectionChanged: true,
  textSelection: null,
  selectedPopupId: null,
  selectedPopupChanged: true,
  selectedModuleName: null,
  cursorStyle: CursorStyle.DEFAULT,
  cursorStyleChanged: true,
  contextBarItems: [],
}

/** @internal */
export interface ViewerActions {
  setDefaultMode(): ViewerState
  setCursorStyle(cursorStyle: CursorStyle): ViewerState
  beginModule(moduleName: string): ViewerState
  endModule(moduleName: string): ViewerState
  addContextBarItem(contextBarItem: ContextBarItem): ViewerState
  selectAnnotation(annotation: Annotation): ViewerState
  deselectAnnotation(): ViewerState
  setTextSelection(selection: PdfRect[] | null): ViewerState
  selectPopup(id: number | null): ViewerState
  deselectPopup(): ViewerState
}

/** @internal */
export const actions: ActionsType<ViewerState, ViewerActions> = {
  setDefaultMode: () => $state => ({
    modeChanged: true,
    mode: ViewerMode.DEFAULT,
    selectedAnnotationId: null,
    selectedAnnotationBehaviors: null,
    selectedAnnotationChanged: true,
    textSelectionChanged: true,
    textSelection: null,
    selectedPopupId: null,
    selectedPopupChanged: true,
    selectedModuleName: null,
    cursorStyle: CursorStyle.DEFAULT,
    cursorStyleChanged: true,
  }),
  addContextBarItem: (contextBarItem: ContextBarItem) => $state => {
    const contextBarItems = $state.contextBarItems
    contextBarItem.itemTypes.forEach(itemType => {
      if (!contextBarItems[itemType]) {
        contextBarItems[itemType] = []
      }
      contextBarItems[itemType].push(contextBarItem)
    })
    return {
      ...$state,
      contextBarItems,
    }
  },
  setCursorStyle: (cursorStyle: CursorStyle) => $state => ({
    ...$state,
    cursorStyle,
    cursorStyleChanged: $state.cursorStyle !== cursorStyle,
  }),
  selectAnnotation: (annotation: Annotation) => $state => ({
    ...$state,
    selectedAnnotationId: annotation.id,
    selectedAnnotationBehaviors: getAnnotationBehaviors(annotation.itemType),
    selectedAnnotationChanged: true,
    selectedModuleName: null,
    selectedPopupId: null,
    modeChanged: true,
    mode: ViewerMode.ANNOTATION_SELECTED,
  }),
  deselectAnnotation: () => $state => {
    const modeChanged = $state.mode === ViewerMode.ANNOTATION_SELECTED
    return {
      ...$state,
      selectedAnnotationId: null,
      selectedAnnotationBehaviors: null,
      selectedModuleName: null,
      selectedAnnotationChanged: true,
      modeChanged,
      mode: modeChanged ? ViewerMode.DEFAULT : $state.mode,
    }
  },
  beginModule: (moduleName: string) => $state => ({
    ...$state,
    modeChanged: true,
    mode: ViewerMode.MODULE_SELECTED,
    selectedAnnotationId: null,
    selectedAnnotationBehaviors: null,
    selectedAnnotationChanged: true,
    textSelectionChanged: true,
    textSelection: null,
    selectedModuleName: moduleName,
    selectedPopupId: null,
    selectedPopupChanged: true,
  }),
  endModule: (moduleName: string) => $state => {
    const selectedModuleName = $state.selectedModuleName === moduleName ? null : $state.selectedModuleName
    const mode = selectedModuleName !== null ? ViewerMode.MODULE_SELECTED : ViewerMode.DEFAULT
    return {
      ...$state,
      modeChanged: true,
      selectedModuleName,
      mode,
    }
  },
  setTextSelection: (textSelection: PdfRect[] | null) => $state => {
    const mode = textSelection ? ViewerMode.TEXT_SELECTED : ViewerMode.DEFAULT
    const modeChanged = $state.mode !== mode
    return {
      ...$state,
      mode,
      modeChanged,
      textSelectionChanged: true,
      textSelection,
    }
  },
  selectPopup: (id: number | null) => $state => {
    const mode = id !== null ? ViewerMode.POPUP_SELECTED : ViewerMode.DEFAULT
    const modeChanged = $state.mode !== mode
    return {
      ...$state,
      mode,
      modeChanged,
      selectedPopupChanged: id !== $state.selectedPopupId,
      selectedPopupId: id,
    }
  },
  deselectPopup: () => $state => {
    const mode = ViewerMode.DEFAULT
    const modeChanged = mode !== $state.mode
    return {
      ...$state,
      mode,
      modeChanged,
    }
  },
}

/** @internal */
export const copyTextToClipboard = (text: string) => {
  const element = document.createElement('textarea')
  element.value = text
  element.setAttribute('readonly', '')
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  document.body.appendChild(element)
  element.select()
  document.execCommand('copy', false, text)
  document.body.removeChild(element)
}
