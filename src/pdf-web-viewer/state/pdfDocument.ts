import { ActionsType } from 'hyperapp'
import { PdfFitMode, PdfPageLayoutMode, PdfDestination } from '../../pdf-viewer-api'

/** @internal */
export interface PdfDocumentState {
  filename: string
  mimetype: string
  minZoom: number
  maxZoom: number
  hasChanges: boolean
  zoom: number
  zoomLevels: number[]
  fitMode: number
  pageLayoutMode: number
  pageCount: number
  firstVisiblePage: number
  lastVisiblePage: number
}

/** @internal */
export const state: PdfDocumentState = {
  filename: '',
  mimetype: '',
  minZoom: 20,
  maxZoom: 400,
  hasChanges: false,
  zoom: 100,
  zoomLevels: [25, 50, 75, 100, 150, 200, 400],
  fitMode: PdfFitMode.ACTUAL_SIZE,
  pageLayoutMode: PdfPageLayoutMode.NONE,
  firstVisiblePage: 0,
  lastVisiblePage: 0,
  pageCount: 0,
}

/** @internal */
export interface PdfDocumentActions {
  setZoom(zoom: number): PdfDocumentState
  setHasChanges(hasChanges: boolean): PdfDocumentState
  setFitMode(fitMode: number): PdfDocumentState
  setPageLayoutMode(fitMode: number): PdfDocumentState
  setPageCount(page: number): PdfDocumentState
  setFirstVisiblePage(page: number): PdfDocumentState
  setLastVisiblePage(page: number): PdfDocumentState
  setFileInfo(file: File | string): PdfDocumentState
}

/** @internal */
export const actions: ActionsType<PdfDocumentState, PdfDocumentActions> = {
  setZoom: (zoom: number) => $state => ({
    ...$state,
    zoom,
  }),
  setFitMode: (fitMode: number) => $state => ({
    ...$state,
    fitMode,
  }),
  setPageLayoutMode: (pageLayoutMode: number) => $state => ({
    ...$state,
    pageLayoutMode,
  }),
  setHasChanges: (hasChanges: boolean) => $state => ({
    ...$state,
    hasChanges,
  }),
  setFirstVisiblePage: (page: number) => $state => {
    const firstVisiblePage = page <= 1 ?
    1 : page < $state.pageCount ?
    page : $state.pageCount
    return {
      ...$state,
      firstVisiblePage,
    }
  },
  setLastVisiblePage: (page: number) => $state => {
    const lastVisiblePage = page <= 1 ?
      1 : page < $state.pageCount ?
      page : $state.pageCount
    return {
      ...$state,
      lastVisiblePage,
    }
  },
  setPageCount: (pageCount: number) => $state => {
    return {
      ...$state,
      pageCount,
    }
  },
  setFileInfo: (file: File) => $state => ({
    ...$state,
    filename: file.name,
    mimetype: file.type,
  }),
}
