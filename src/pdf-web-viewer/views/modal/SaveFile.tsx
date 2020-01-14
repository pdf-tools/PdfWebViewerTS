import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { translationManager } from '../../../common/TranslationManager'
import { LoadingIndicator } from '../loader/LoadingIndicator'

/** @internal */
export const SaveFile: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-modal" >
    <div class="pwv-modal-dialog">
      <div class="pwv-modal-body">`
        <div class="pwv-modal-message">
          <h2>{translationManager.getText('saveFile.title')}</h2>
          <LoadingIndicator />
        </div>
      </div>
    </div>
  </div>
)
