import { h, Component, ActionResult } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { DropdownComponent } from '../../../common/Dropdown'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export interface SearchOptionsProps {
  disabled?: boolean
  active?: boolean
  onClick?(e: MouseEvent): void
}

/** @internal */
export const SearchOptions: Component<SearchOptionsProps, PdfWebViewerState, PdfWebViewerActions> =
  ({ disabled }, children) => (state, actions) => {
    if (disabled) {
      return (
        <div class="pwv-dropdown pwv-searchoptions pwv-disabled pwv-dropdown-align-right" >
          <span class="pwv-dropdown-text">
            <Icon icon={icons.options} />
          </span>
          <span class="pwv-dropdown-caret">
            <Icon icon={icons.dropdownCaret} />
          </span>
        </div>
      )
    } else {
      return (
        <div class="pwv-dropdown pwv-searchoptions pwv-dropdown-align-right" >
          <button
            oncreate={DropdownComponent.create}
            onremove={DropdownComponent.remove}
          >
            <span class="pwv-dropdown-text">
              <Icon icon={icons.options} />
            </span>

            <span class="pwv-dropdown-caret">
              <Icon icon={icons.dropdownCaret} />
            </span>

          </button>
          <div class="pwv-dropdown-panel">
            <ul>
              <li
                class="pwv-checkbox-btn"
                onclick={(e: MouseEvent) => {
                  const s = actions.search.toggleCaseSensitive()
                  e.preventDefault()
                  e.cancelBubble = true
                  if (s.searchString !== '') {
                    actions.api.startSearch()
                  }
                }}
              >
                {state.search.caseSensitive ?
                  <Icon icon={icons.checkboxChecked} /> :
                  <Icon icon={icons.checkbox} />
                }
                {translationManager.getText('search.optionCaseSensitive')}
              </li>
              <li
                class="pwv-checkbox-btn"
                onclick={(e: MouseEvent) => {
                  const s = actions.search.toggleWrappingSearch()
                  e.preventDefault()
                  e.cancelBubble = true
                  if (s.searchString !== '') {
                    actions.api.startSearch()
                  }
                }}
              >
                {state.search.wrapSearch ?
                  <Icon icon={icons.checkboxChecked} /> :
                  <Icon icon={icons.checkbox} />
                }
                {translationManager.getText('search.optionWrapSearch')}
              </li>
              <li
                class="pwv-checkbox-btn"
                onclick={(e: MouseEvent) => {
                  const s = actions.search.toggleRegex()
                  e.preventDefault()
                  e.cancelBubble = true
                  if (s.searchString !== '') {
                    actions.api.startSearch()
                  }
                }}
              >
                {state.search.useRegex ?
                  <Icon icon={icons.checkboxChecked} /> :
                  <Icon icon={icons.checkbox} />
                }
                {translationManager.getText('search.optionRegularExpression')}
              </li>
            </ul>
          </div>
        </div>
      )
    }
  }
