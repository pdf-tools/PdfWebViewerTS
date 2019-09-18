import { ActionsType } from 'hyperapp'

/** @internal */
export interface SearchState {
  showSearch: boolean
  searchString: '',
  caseSensitive: boolean
  wrapSearch: boolean
  useRegex: boolean
}

/** @internal */
export const state: SearchState = {
  showSearch: false,
  searchString: '',
  caseSensitive: false,
  wrapSearch: false,
  useRegex: false,
}

/** @internal */
export interface SearchActions {
  updateToSearch(searchString: string): SearchState
  toggleSearch(): SearchState
  toggleCaseSensitive(): SearchState
  toggleWrappingSearch(): SearchState
  toggleRegex(): SearchState
}

/** @internal */
export const actions: ActionsType<SearchState, SearchActions> = {
  updateToSearch: (searchString: string) => $state => ({
    ...$state,
    searchString,
  }),
  toggleSearch: () => $state => ({
    ...$state,
    showSearch: !$state.showSearch,
  }),
  toggleCaseSensitive: () => $state => ({
    ...$state,
    caseSensitive: !$state.caseSensitive,
  }),
  toggleWrappingSearch: () => $state => ({
    ...$state,
    wrapSearch: !$state.wrapSearch,
  }),
  toggleRegex: () => $state => ({
    ...$state,
    useRegex: !$state.useRegex,
  }),
}
