import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const OpenFileError: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-modal" >
    <div class="pwv-modal-dialog">
      <div class="pwv-modal-header">
        <Icon icon={icons.fileError} />
        <h2>{translationManager.getText('openFileError.title')}</h2>
      </div>
      <div class="pwv-modal-body">
        <div class="pwv-modal-message">
          <p>{translationManager.getText('openFileError.description')}</p>
        </div>
        <div class="pwv-btn-row">
          <button
            class="pwv-btn"
            onclick={actions.loadDocumentConfirmRejected}
          >
            {translationManager.getText('openFileError.btnOk')}
          </button>
        </div>
      </div>
    </div>
  </div>
)
