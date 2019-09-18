import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'
import { LoadingIndicator } from '../loader/LoadingIndicator'

/** @internal */
export const LoadFile: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-modal" >
    <div class="pwv-modal-dialog">
      <div class="pwv-modal-body">`
        <div class="pwv-modal-message">
          <h2>{translationManager.getText('loadFile.title')}</h2>
          <LoadingIndicator />
        </div>
      </div>
    </div>
  </div>
)
