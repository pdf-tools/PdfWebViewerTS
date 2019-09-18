import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { CommandbarSeparator } from '../../../common/CommandbarSeparator'
import { icons } from '../../../common/icons'
import { SearchOptions } from './SearchOptions'

/** @internal */
export const SearchBar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-searchbar">
    <div class="pwv-commandbar">
    </div>
    <div class="pwv-commandbar" style={{ marginLeft: 'auto' }}>
      <div class="pwv-commandbar-item pwv-searchbar-input">
        <input
          oncreate={(element: HTMLInputElement) => {
            element.focus()
            element.value = state.search.searchString
            element.addEventListener('keydown', (e: KeyboardEvent) => {
              e.cancelBubble = true
            }, false)
            element.addEventListener('keyup', (e: KeyboardEvent) => {
              e.cancelBubble = true
              const inputValue = (e.currentTarget as HTMLInputElement).value
              if (e.key === 'Enter' || e.key === 'ArrowDown') {
                if (inputValue !== '') {
                  actions.api.nextSearchMatch()
                }
              } else if (e.key === 'ArrowUp') {
                if (inputValue !== '') {
                  actions.api.previousSearchMatch()
                }
              } else {
                actions.search.updateToSearch(inputValue)
                if (inputValue !== '') {
                  actions.api.startSearch()
                } else {
                  actions.api.endSearch()
                }
              }
            }, false)
          }}
        />
      </div>
      <CommandbarButton
        className="pwv-btn-sm"
        icon={icons.previousMatch}
        disabled={state.search.searchString === ''}
        onClick={actions.api.previousSearchMatch}
      />
      <CommandbarButton
        className="pwv-btn-sm"
        icon={icons.nextMatch}
        disabled={state.search.searchString === ''}
        onClick={actions.api.nextSearchMatch}
      />
      <SearchOptions />
      <CommandbarSeparator />
      <CommandbarButton
        icon={icons.close}
        onClick={() => {
          actions.api.endSearch()
          actions.search.toggleSearch()
        }}
      />
    </div>
  </div>
)
