import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const ApplicationError: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => {

  let message = translationManager.getText('applicationError.defaultErrorMessage')
  switch (state.errorMessage) {
    case 'Invalid License':
      message = translationManager.getText('applicationError.invalidLicense')
      break
  }

  return (
    <div class="pwv-modal">
      <div class="pwv-modal-dialog">
        <div class="pwv-modal-header">
          <Icon icon={icons.error} />
          <h2>{translationManager.getText('applicationError.title')}</h2>
        </div>
        <div class="pwv-modal-body">
          <div class="pwv-modal-message">
            <p>{message}</p>
          </div>
          <div class="pwv-btn-row">
            <button class="pwv-btn" onclick={() => { document.location && document.location.reload()}} >
              {translationManager.getText('applicationError.btnReload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
