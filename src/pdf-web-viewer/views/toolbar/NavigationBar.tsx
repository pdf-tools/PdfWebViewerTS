import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { icons } from '../../../common/icons'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const NavigationBar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({}) => (state, actions) => (
  <div class="pwv-commandbar pwv-navigation-toolbar">
     <CommandbarButton
      icon={icons.previousPage}
      onClick={() => actions.api.previousPage()}
      disabled={state.pdfDocument.firstVisiblePage <= 1}
      />
    <div class="pwv-commandbar-item pwv-navigation-toolbar-pageinput">
      <input
        value={state.pdfDocument.firstVisiblePage}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === 'ArrowDown') {
            actions.api.nextPage()
          } else if (e.key === 'ArrowUp') {
            actions.api.previousPage()
          } else if (e.key === 'Enter') {
            const input = e.currentTarget as any
            if (input && input.value) {
              actions.api.setPageNumber(parseInt(input.value, undefined))
            }
          } else if (
            (e.key.charCodeAt(0) >= 48 && e.key.charCodeAt(0) <= 57) || // allow numbers 0-9
            e.key === 'Delete' ||
            e.key === 'Backspace' ||
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'Tab'
          ) {
            // do nothing
          } else {
            e.preventDefault()
          }
          e.stopPropagation()
        }}
        onblur={(e: Event) => {
          const value = parseInt((e.target as HTMLInputElement).value, undefined)
          if (value !== state.pdfDocument.firstVisiblePage) {
            actions.api.setPageNumber(value)
          }
        }}
        disabled={state.pdfDocument.pageCount < 1}
        />
      <span>
        {translationManager.getText('navigation.of')}
      </span>
      <label>
        {state.pdfDocument.pageCount}
      </label>
    </div>
    <CommandbarButton
      icon={icons.nextPage}
      onClick={() => actions.api.nextPage()}
      disabled={state.pdfDocument.firstVisiblePage === state.pdfDocument.pageCount}
    />
  </div>
)
