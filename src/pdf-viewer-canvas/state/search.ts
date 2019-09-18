import { ActionsType } from './appState'
import { PdfRect } from '../../pdf-viewer-api'

/** @internal */
export interface SearchState {
  searchString: string
  caseSensitive: boolean
  wrapSearch: boolean
  useRegex: boolean
  index: number
  page: number
  match: PdfRect[] | null
}

/** @internal */
export const state: SearchState = {
  searchString: '',
  caseSensitive: false,
  wrapSearch: false,
  useRegex: false,
  index: 0,
  page: 1,
  match: null,
}

/** @internal */
export interface StartSearchPayload {
  searchString: string
  reverse: boolean
  caseSensitive: boolean
  wrapSearch: boolean
  useRegex: boolean
}

/** @internal */
export interface UpdateSearchMatchPayload {
  page: number
  index: number
  match: PdfRect[]
}

/** @internal */
export interface SearchActions {
  start(payload: StartSearchPayload): SearchState,
  updateMatch(payload: UpdateSearchMatchPayload): SearchState,
  clear(): SearchState
}

/** @internal */
export const actions: ActionsType<SearchState, SearchActions> = {
  start: (payload: StartSearchPayload) => $state => ({
    ...$state,
    ...payload,
    match: null,
    index: 0,
    page: 1,
  }),
  updateMatch: (payload: UpdateSearchMatchPayload) => $state => ({
    ...$state,
    ...payload,
  }),
  clear: () => $state => ({
    searchString: '',
    caseSensitive: false,
    wrapSearch: false,
    useRegex: false,
    index: 0,
    page: 1,
    match: null,
  }),
}
